const router = require('express').Router();
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { register } = require('../services/push');

// GET /api/notifications — dernières 50 notifs
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

// GET /api/notifications/stream — SSE temps réel
// EventSource ne supporte pas les headers, on accepte le JWT en query param
router.get('/stream', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).end();

  let userId;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    userId = payload.id;
  } catch {
    return res.status(401).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // désactive le buffer nginx/Render
  res.flushHeaders();
  res.write(':connected\n\n');

  const unregister = register(userId, res);

  // Heartbeat toutes les 25s pour éviter les timeouts proxy
  const heartbeat = setInterval(() => {
    try { res.write(':ping\n\n'); } catch { clearInterval(heartbeat); }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unregister();
  });
});

// PATCH /api/notifications/:id/read — marquer une notif comme lue
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

// PATCH /api/notifications/read-all — tout marquer comme lu
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
