// Routes de gestion des demandes de tutorat (TutoringRequest).
// Flux : élève crée → tuteur accepte ou refuse → notification + email des deux côtés.
const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { sendEmail } = require('../emails/sender');
const T = require('../emails/templates');
const { push } = require('../services/push');
const validate = require('../middleware/validate');
const { requestCreateSchema, requestUpdateSchema } = require('../schemas');

// ─── GET /api/requests — liste les demandes de l'utilisateur connecté ───────────
router.get('/', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
    // Un tuteur voit les demandes qu'il a reçues ; un élève voit celles qu'il a envoyées
    const where = role === 'TUTEUR' ? { tuteurId: id } : { eleveId: id };

    const requests = await prisma.tutoringRequest.findMany({
      where,
      include: {
        eleve:  { select: { id: true, prenom: true, nom: true, photo: true, niveau: true } },
        tuteur: { select: { id: true, prenom: true, nom: true, photo: true, matieres: true, tarif: true, tel: true, whatsapp: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/requests — créer une demande ─────────────────────────────────────
router.post('/', auth, validate(requestCreateSchema), async (req, res) => {
  try {
    if (req.user.role !== 'ELEVE')
      return res.status(403).json({ error: 'Réservé aux élèves' });

    const { tuteurId, matiere, niveau, jours, duree, mode, message, tarif } = req.body;

    const [request, tuteur] = await Promise.all([
      prisma.tutoringRequest.create({
        data: {
          eleveId: req.user.id,
          tuteurId, matiere, niveau,
          jours: jours ?? [],
          duree, mode, message, tarif,
        },
        include: {
          eleve:  { select: { id: true, prenom: true, nom: true } },
          tuteur: { select: { id: true, prenom: true, nom: true, email: true } },
        },
      }),
      prisma.user.findUnique({ where: { id: tuteurId }, select: { prenom: true, nom: true, email: true } }),
    ]);

    const eleve = request.eleve;

    // Notification en base + SSE push + email au tuteur (en parallèle, sans bloquer la réponse)
    Promise.all([
      prisma.notification.create({
        data: {
          userId: tuteurId,
          type: 'new_request',
          emoji: '📬',
          title: 'Nouvelle demande reçue',
          body: `${eleve.prenom} ${eleve.nom} souhaite des cours de ${matiere}.`,
        },
      }).then(n => { push(tuteurId, n); return n; }),
      tuteur?.email && sendEmail({
        to: tuteur.email,
        subject: `📬 Nouvelle demande de cours — ${eleve.prenom} ${eleve.nom}`,
        html: T.newRequestEmail({ tuteur, eleve, matiere, niveau, message }),
      }),
    ]).catch(err => console.error('[REQUEST NOTIF]', err));

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── DELETE /api/requests/:id — annuler une demande EN_ATTENTE (élève seulement) ─
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ELEVE')
      return res.status(403).json({ error: 'Réservé aux élèves' });

    const existing = await prisma.tutoringRequest.findUnique({
      where: { id: req.params.id },
      include: {
        tuteur: { select: { id: true, prenom: true, nom: true } },
        eleve:  { select: { prenom: true, nom: true } },
      },
    });
    if (!existing) return res.status(404).json({ error: 'Demande introuvable' });
    if (existing.eleveId !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });
    if (existing.status !== 'EN_ATTENTE')
      return res.status(409).json({ error: 'Seules les demandes en attente peuvent être annulées' });

    await prisma.tutoringRequest.delete({ where: { id: req.params.id } });

    const { tuteur, eleve, matiere } = existing;
    prisma.notification.create({
      data: {
        userId: tuteur.id,
        type: 'request_cancelled',
        emoji: '↩️',
        title: 'Demande annulée',
        body: `${eleve.prenom} ${eleve.nom} a annulé sa demande de ${matiere}.`,
      },
    }).then(n => push(tuteur.id, n)).catch(() => {});

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PATCH /api/requests/:id — changer le statut ────────────────────────────────
router.patch('/:id', auth, validate(requestUpdateSchema), async (req, res) => {
  try {
    if (req.user.role !== 'TUTEUR')
      return res.status(403).json({ error: 'Réservé aux tuteurs' });

    const { status } = req.body;

    const existing = await prisma.tutoringRequest.findUnique({
      where: { id: req.params.id },
      include: {
        eleve:  { select: { id: true, prenom: true, nom: true, email: true } },
        tuteur: { select: { id: true, prenom: true, nom: true } },
      },
    });
    if (!existing) return res.status(404).json({ error: 'Demande introuvable' });
    if (existing.tuteurId !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });

    const updated = await prisma.tutoringRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    const { eleve, tuteur, matiere } = existing;

    // Notification DB + email élève + conversation si confirmée (en parallèle)
    const tasks = [
      prisma.notification.create({
        data: {
          userId: eleve.id,
          type: status === 'CONFIRMEE' ? 'request_confirmed' : 'request_refused',
          emoji: status === 'CONFIRMEE' ? '✅' : '❌',
          title: status === 'CONFIRMEE' ? 'Séance confirmée !' : 'Demande non retenue',
          body: status === 'CONFIRMEE'
            ? `${tuteur.prenom} ${tuteur.nom} a accepté votre demande pour ${matiere}.`
            : `${tuteur.prenom} ${tuteur.nom} n'est pas disponible pour cette période.`,
        },
      }).then(n => { push(eleve.id, n); return n; }),
      eleve.email && sendEmail({
        to: eleve.email,
        subject: status === 'CONFIRMEE'
          ? `✅ Séance de ${matiere} confirmée — e-Tutorat`
          : `Votre demande de ${matiere} — e-Tutorat`,
        html: T.requestStatusEmail({ eleve, tuteur, matiere, status }),
      }),
    ];

    // Si la demande est confirmée, créer automatiquement une conversation entre élève et tuteur
    // si elle n'existe pas encore (un seul fil de discussion par paire)
    if (status === 'CONFIRMEE') {
      tasks.push(
        prisma.conversation.findFirst({
          where: {
            AND: [
              { members: { some: { userId: eleve.id } } },
              { members: { some: { userId: existing.tuteurId } } },
            ],
          },
        }).then(existingConv => {
          if (!existingConv) {
            return prisma.conversation.create({
              data: {
                members: {
                  create: [{ userId: eleve.id }, { userId: existing.tuteurId }],
                },
              },
            });
          }
        })
      );
    }

    Promise.all(tasks).catch(err => console.error('[STATUS NOTIF]', err));

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
