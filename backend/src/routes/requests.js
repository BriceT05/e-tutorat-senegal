const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// GET /api/requests — mes demandes (élève ou tuteur)
router.get('/', auth, async (req, res) => {
  try {
    const { id, role } = req.user;
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

// POST /api/requests — créer une demande (élève uniquement)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ELEVE')
      return res.status(403).json({ error: 'Réservé aux élèves' });

    const { tuteurId, matiere, niveau, jours, duree, mode, message, tarif } = req.body;
    if (!tuteurId || !matiere) return res.status(400).json({ error: 'tuteurId et matiere requis' });

    const request = await prisma.tutoringRequest.create({
      data: {
        eleveId: req.user.id,
        tuteurId, matiere, niveau,
        jours: jours || [],
        duree, mode, message,
        tarif: tarif ? parseInt(tarif) : null,
      },
      include: {
        eleve:  { select: { id: true, prenom: true, nom: true } },
        tuteur: { select: { id: true, prenom: true, nom: true } },
      },
    });

    // Notifier le tuteur
    await prisma.notification.create({
      data: {
        userId: tuteurId,
        type: 'new_request',
        emoji: '📬',
        title: 'Nouvelle demande reçue',
        body: `${request.eleve.prenom} ${request.eleve.nom} souhaite des cours de ${matiere}.`,
      },
    });

    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/requests/:id — changer le statut (tuteur uniquement)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'TUTEUR')
      return res.status(403).json({ error: 'Réservé aux tuteurs' });

    const { status } = req.body;
    if (!['CONFIRMEE', 'REFUSEE'].includes(status))
      return res.status(400).json({ error: 'Statut invalide' });

    const existing = await prisma.tutoringRequest.findUnique({ where: { id: req.params.id }, include: { eleve: true, tuteur: true } });
    if (!existing) return res.status(404).json({ error: 'Demande introuvable' });
    if (existing.tuteurId !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });

    const updated = await prisma.tutoringRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Notifier l'élève
    await prisma.notification.create({
      data: {
        userId: existing.eleveId,
        type: status === 'CONFIRMEE' ? 'request_confirmed' : 'request_refused',
        emoji: status === 'CONFIRMEE' ? '✅' : '❌',
        title: status === 'CONFIRMEE' ? 'Séance confirmée !' : 'Demande non retenue',
        body: status === 'CONFIRMEE'
          ? `${existing.tuteur.prenom} ${existing.tuteur.nom} a accepté votre demande pour ${existing.matiere}.`
          : `${existing.tuteur.prenom} ${existing.tuteur.nom} n'est pas disponible pour cette période.`,
      },
    });

    // Créer une conversation élève↔tuteur si la demande est confirmée (et qu'elle n'existe pas déjà)
    if (status === 'CONFIRMEE') {
      const existingConv = await prisma.conversation.findFirst({
        where: {
          AND: [
            { members: { some: { userId: existing.eleveId } } },
            { members: { some: { userId: existing.tuteurId } } },
          ],
        },
      });
      if (!existingConv) {
        await prisma.conversation.create({
          data: {
            members: {
              create: [
                { userId: existing.eleveId },
                { userId: existing.tuteurId },
              ],
            },
          },
        });
      }
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
