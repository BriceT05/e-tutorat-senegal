const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { messageCreateSchema } = require('../schemas');

// GET /api/messages — mes conversations
router.get('/', auth, async (req, res) => {
  try {
    const members = await prisma.conversationMember.findMany({
      where: { userId: req.user.id },
      include: {
        conversation: {
          include: {
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            members: {
              include: { user: { select: { id: true, prenom: true, nom: true, photo: true, role: true } } },
            },
          },
        },
      },
    });

    const convs = members.map(m => ({
      id: m.conversationId,
      unread: m.unread,
      lastMessage: m.conversation.messages[0] || null,
      contact: m.conversation.members
        .find(mb => mb.userId !== req.user.id)?.user || null,
    }));

    res.json(convs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/:conversationId — messages d'une conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const member = await prisma.conversationMember.findUnique({
      where: { userId_conversationId: { userId: req.user.id, conversationId: req.params.conversationId } },
    });
    if (!member) return res.status(403).json({ error: 'Accès refusé' });

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, prenom: true, nom: true, photo: true } } },
    });

    // Marquer comme lu
    await prisma.conversationMember.update({
      where: { userId_conversationId: { userId: req.user.id, conversationId: req.params.conversationId } },
      data: { unread: 0 },
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages — envoyer un message (crée la conversation si besoin)
router.post('/', auth, validate(messageCreateSchema), async (req, res) => {
  try {
    const { recipientId, text, conversationId } = req.body;

    let convId = conversationId;

    if (!convId) {
      if (!recipientId) return res.status(400).json({ error: 'recipientId requis' });

      // Chercher une conversation existante entre les deux
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { members: { some: { userId: req.user.id } } },
            { members: { some: { userId: recipientId } } },
          ],
        },
      });

      if (existing) {
        convId = existing.id;
      } else {
        const conv = await prisma.conversation.create({
          data: {
            members: {
              create: [
                { userId: req.user.id },
                { userId: recipientId },
              ],
            },
          },
        });
        convId = conv.id;
      }
    }

    const message = await prisma.message.create({
      data: { conversationId: convId, senderId: req.user.id, text: text.trim() },
      include: { sender: { select: { id: true, prenom: true, nom: true, photo: true } } },
    });

    // Incrémenter unread pour les autres membres
    await prisma.conversationMember.updateMany({
      where: { conversationId: convId, userId: { not: req.user.id } },
      data: { unread: { increment: 1 } },
    });

    res.status(201).json({ message, conversationId: convId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
