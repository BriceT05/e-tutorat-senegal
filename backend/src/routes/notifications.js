const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifs);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notif || notif.userId !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });
    const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
