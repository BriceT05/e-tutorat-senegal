const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const validate = require('../middleware/validate');
const { reviewCreateSchema } = require('../schemas');

// Lit le JWT si présent sans bloquer si absent
const optAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); } catch {}
  }
  next();
};

// ─── GET /api/reviews/:tuteurId ───────────────────────────────────────────────
router.get('/:tuteurId', optAuth, async (req, res) => {
  try {
    const { tuteurId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { tuteurId },
      include: {
        eleve: { select: { id: true, prenom: true, nom: true, photo: true, niveau: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let canReview = false;
    let hasReviewed = false;

    if (req.user?.id && req.user.role === 'ELEVE') {
      const existing = await prisma.review.findUnique({
        where: { tuteurId_eleveId: { tuteurId, eleveId: req.user.id } },
      });
      hasReviewed = !!existing;

      if (!hasReviewed) {
        const confirmed = await prisma.tutoringRequest.findFirst({
          where: { eleveId: req.user.id, tuteurId, status: 'CONFIRMEE' },
        });
        canReview = !!confirmed;
      }
    }

    res.json({ reviews, canReview, hasReviewed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/reviews ────────────────────────────────────────────────────────
router.post('/', auth, validate(reviewCreateSchema), async (req, res) => {
  try {
    if (req.user.role !== 'ELEVE')
      return res.status(403).json({ error: 'Réservé aux élèves' });

    const { tuteurId, note, commentaire } = req.body;

    const confirmed = await prisma.tutoringRequest.findFirst({
      where: { eleveId: req.user.id, tuteurId, status: 'CONFIRMEE' },
    });
    if (!confirmed)
      return res.status(403).json({ error: 'Vous devez avoir une séance confirmée pour laisser un avis' });

    let review;
    try {
      review = await prisma.review.create({
        data: {
          tuteurId,
          eleveId: req.user.id,
          note,
          commentaire: commentaire?.trim() || null,
        },
        include: {
          eleve: { select: { id: true, prenom: true, nom: true, photo: true, niveau: true } },
        },
      });
    } catch (e) {
      if (e.code === 'P2002') return res.status(409).json({ error: 'Vous avez déjà laissé un avis pour ce tuteur' });
      throw e;
    }

    // Recalculer noteAvg et nbAvis du tuteur
    const agg = await prisma.review.aggregate({
      where: { tuteurId },
      _avg: { note: true },
      _count: { note: true },
    });
    await prisma.user.update({
      where: { id: tuteurId },
      data: {
        noteAvg: Math.round((agg._avg.note || 0) * 10) / 10,
        nbAvis: agg._count.note,
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
