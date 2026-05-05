const router = require('express').Router();
const prisma = require('../prisma');

const slugify = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-');

// ─── GET /api/articles — liste publique ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { categorie, q, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { publie: true };
    if (categorie && categorie !== 'all') where.categorie = categorie;
    if (q) where.OR = [
      { titre:   { contains: q, mode: 'insensitive' } },
      { extrait: { contains: q, mode: 'insensitive' } },
    ];

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { auteur: { select: { id: true, prenom: true, nom: true, photo: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.article.count({ where }),
    ]);

    res.json({ articles, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/articles/:slug — article public ─────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const article = await prisma.article.findFirst({
      where: { slug: req.params.slug, publie: true },
      include: { auteur: { select: { id: true, prenom: true, nom: true, photo: true, role: true } } },
    });
    if (!article) return res.status(404).json({ error: 'Article introuvable' });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
module.exports.slugify = slugify;
