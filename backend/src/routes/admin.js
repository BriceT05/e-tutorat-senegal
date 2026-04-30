const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  next();
};

// GET /api/admin/stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalTuteurs, totalEleves, totalRequests, totalMessages, totalConversations] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TUTEUR' } }),
      prisma.user.count({ where: { role: 'ELEVE' } }),
      prisma.tutoringRequest.count(),
      prisma.message.count(),
      prisma.conversation.count(),
    ]);
    const requestsByStatus = await prisma.tutoringRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const statusMap = Object.fromEntries(requestsByStatus.map(r => [r.status, r._count.status]));
    res.json({
      totalUsers, totalTuteurs, totalEleves, totalRequests, totalMessages, totalConversations,
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

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['ELEVE', 'TUTEUR', 'ADMIN'].includes(role))
      return res.status(400).json({ error: 'Rôle invalide' });
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

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
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

module.exports = router;
