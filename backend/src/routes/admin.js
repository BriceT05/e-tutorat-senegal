// Routes réservées aux administrateurs : statistiques, gestion des utilisateurs,
// des demandes et des articles du blog. Toutes les routes passent par auth + adminOnly.
const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { slugify } = require('./articles');
const validate = require('../middleware/validate');
const { roleUpdateSchema, articleSchema, articleUpdateSchema } = require('../schemas');
const { sendEmail } = require('../emails/sender');
const T = require('../emails/templates');
const { push } = require('../services/push');

// Middleware de garde — refuse tout accès si le rôle n'est pas ADMIN
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  next();
};

// GET /api/admin/stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalTuteurs, totalEleves, totalRequests, totalMessages, totalConversations, tuteursEnAttente] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TUTEUR' } }),
      prisma.user.count({ where: { role: 'ELEVE' } }),
      prisma.tutoringRequest.count(),
      prisma.message.count(),
      prisma.conversation.count(),
      prisma.user.count({ where: { role: 'TUTEUR', verifie: false } }),
    ]);
    const requestsByStatus = await prisma.tutoringRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const statusMap = Object.fromEntries(requestsByStatus.map(r => [r.status, r._count.status]));
    res.json({
      totalUsers, totalTuteurs, totalEleves, totalRequests, totalMessages, totalConversations,
      tuteursEnAttente,
      requestsEnAttente: statusMap.EN_ATTENTE || 0,
      requestsConfirmees: statusMap.CONFIRMEE || 0,
      requestsRefusees: statusMap.REFUSEE || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/users?role=&q=&page=&limit=
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role, q, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { prenom: { contains: q, mode: 'insensitive' } },
        { nom:    { contains: q, mode: 'insensitive' } },
        { email:  { contains: q, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, prenom: true, nom: true, email: true, role: true,
          region: true, createdAt: true, photo: true,
          matieres: true, noteAvg: true, nbAvis: true,
          _count: { select: { requestsAsEleve: true, requestsAsTuteur: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/admin/users/:id/role — changer le rôle d'un utilisateur (ELEVE/TUTEUR/ADMIN)
router.patch('/users/:id/role', auth, adminOnly, validate(roleUpdateSchema), async (req, res) => {
  try {
    const { role } = req.body;
    // Empêcher un admin de se rétrograder lui-même accidentellement
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'Impossible de modifier son propre rôle' });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, prenom: true, nom: true, email: true, role: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/users/:id — suppression définitive (cascade sur toutes les données liées)
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    // Empêcher un admin de supprimer son propre compte (protection contre la maladresse)
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'Impossible de supprimer son propre compte' });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/requests?status=&q=&page=&limit=
router.get('/requests', auth, adminOnly, async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { matiere: { contains: q, mode: 'insensitive' } },
        { eleve:  { OR: [{ prenom: { contains: q, mode: 'insensitive' } }, { nom: { contains: q, mode: 'insensitive' } }] } },
        { tuteur: { OR: [{ prenom: { contains: q, mode: 'insensitive' } }, { nom: { contains: q, mode: 'insensitive' } }] } },
      ];
    }
    const [requests, total] = await Promise.all([
      prisma.tutoringRequest.findMany({
        where,
        include: {
          eleve:  { select: { id: true, prenom: true, nom: true, photo: true } },
          tuteur: { select: { id: true, prenom: true, nom: true, photo: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.tutoringRequest.count({ where }),
    ]);
    res.json({ requests, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/admin/tuteurs/pending — tuteurs en attente de vérification ──────
router.get('/tuteurs/pending', auth, adminOnly, async (req, res) => {
  try {
    const tuteurs = await prisma.user.findMany({
      where: { role: 'TUTEUR', verifie: false },
      select: {
        id: true, prenom: true, nom: true, email: true, photo: true,
        region: true, bio: true, diplome: true, matieres: true, niveaux: true,
        tarif: true, modeCours: true, experience: true, langues: true, formations: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(tuteurs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PATCH /api/admin/tuteurs/:id/approve — approuver un tuteur ───────────────
router.patch('/tuteurs/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const tuteur = await prisma.user.update({
      where: { id: req.params.id },
      data: { verifie: true },
      select: { id: true, prenom: true, nom: true, email: true, verifie: true },
    });

    // Notification in-app + email (sans bloquer la réponse)
    Promise.all([
      prisma.notification.create({
        data: {
          userId: tuteur.id,
          type: 'account_verified',
          emoji: '✅',
          title: 'Profil vérifié !',
          body: 'Votre profil tuteur a été validé. Vous êtes maintenant visible par les élèves.',
        },
      }).then(n => { push(tuteur.id, n); return n; }),
      tuteur.email && sendEmail({
        to: tuteur.email,
        subject: '✅ Votre profil tuteur est validé — e-Tutorat Sénégal',
        html: T.tuteurApprovedEmail({ prenom: tuteur.prenom }),
      }),
    ]).catch(err => console.error('[APPROVE NOTIF]', err));

    res.json(tuteur);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Tuteur introuvable' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PATCH /api/admin/tuteurs/:id/reject — rejeter un tuteur ─────────────────
router.patch('/tuteurs/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'Impossible de modifier son propre compte' });

    const tuteur = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: 'ELEVE', verifie: false },
      select: { id: true, prenom: true, nom: true, email: true, role: true },
    });

    Promise.all([
      prisma.notification.create({
        data: {
          userId: tuteur.id,
          type: 'account_rejected',
          emoji: '❌',
          title: 'Profil non validé',
          body: 'Votre profil tuteur n\'a pas pu être validé. Consultez votre email pour plus d\'informations.',
        },
      }).then(n => { push(tuteur.id, n); return n; }),
      tuteur.email && sendEmail({
        to: tuteur.email,
        subject: 'Votre profil tuteur — e-Tutorat Sénégal',
        html: T.tuteurRejectedEmail({ prenom: tuteur.prenom }),
      }),
    ]).catch(err => console.error('[REJECT NOTIF]', err));

    res.json(tuteur);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Tuteur introuvable' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/admin/articles ──────────────────────────────────────────────────
router.get('/articles', auth, adminOnly, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const where = {};
    if (q) where.OR = [
      { titre:   { contains: q, mode: 'insensitive' } },
      { extrait: { contains: q, mode: 'insensitive' } },
    ];
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { auteur: { select: { id: true, prenom: true, nom: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.article.count({ where }),
    ]);
    res.json({ articles, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/admin/articles ─────────────────────────────────────────────────
router.post('/articles', auth, adminOnly, validate(articleSchema), async (req, res) => {
  try {
    const { titre, slug, extrait, contenu, categorie, coverUrl, publie } = req.body;

    // Génère un slug depuis le titre si non fourni ; timestamp en dernier recours
    const finalSlug = (slug?.trim() || slugify(titre)) || `article-${Date.now()}`;

    const article = await prisma.article.create({
      data: {
        titre: titre.trim(),
        slug: finalSlug,
        extrait: extrait?.trim() || null,
        contenu: contenu.trim(),
        categorie,
        coverUrl: coverUrl?.trim() || null,
        publie: Boolean(publie),
        auteurId: req.user.id,
      },
      include: { auteur: { select: { id: true, prenom: true, nom: true } } },
    });
    res.status(201).json(article);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ce slug est déjà utilisé' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PUT /api/admin/articles/:id ─────────────────────────────────────────────
router.put('/articles/:id', auth, adminOnly, validate(articleUpdateSchema), async (req, res) => {
  try {
    const { titre, slug, extrait, contenu, categorie, coverUrl, publie } = req.body;

    const data = {};
    if (titre !== undefined)    data.titre    = titre.trim();
    if (slug !== undefined)     data.slug     = slug.trim() || slugify(titre || '');
    if (extrait !== undefined)  data.extrait  = extrait?.trim() || null;
    if (contenu !== undefined)  data.contenu  = contenu.trim();
    if (categorie !== undefined) data.categorie = categorie;
    if (coverUrl !== undefined) data.coverUrl = coverUrl?.trim() || null;
    if (publie !== undefined)   data.publie   = Boolean(publie);

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data,
      include: { auteur: { select: { id: true, prenom: true, nom: true } } },
    });
    res.json(article);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ce slug est déjà utilisé' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Article introuvable' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── DELETE /api/admin/articles/:id ──────────────────────────────────────────
router.delete('/articles/:id', auth, adminOnly, async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Article introuvable' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
