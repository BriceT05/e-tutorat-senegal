const router = require('express').Router();
const prisma = require('../prisma');

// GET /api/tuteurs?matiere=&region=&niveau=&mode=&tarifMax=&q=
router.get('/', async (req, res) => {
  try {
    const { matiere, region, niveau, mode, tarifMax, q } = req.query;

    const where = { role: 'TUTEUR' };

    if (region) where.region = region;
    if (mode)   where.modeCours = mode;
    if (tarifMax) where.tarif = { lte: parseInt(tarifMax) };
    if (matiere) where.matieres = { has: matiere };
    if (niveau)  where.niveaux  = { has: niveau };

    let tuteurs = await prisma.user.findMany({
      where,
      select: {
        id: true, prenom: true, nom: true, photo: true,
        region: true, bio: true, diplome: true,
        matieres: true, niveaux: true, tarif: true, modeCours: true,
        noteAvg: true, nbAvis: true, createdAt: true,
        experience: true, methodologie: true, disponibilites: true,
        tauxReponse: true, delaiReponse: true, totalEleves: true,
        langues: true, formations: true,
      },
    });

    if (q) {
      const lq = q.toLowerCase();
      tuteurs = tuteurs.filter(t =>
        `${t.prenom} ${t.nom}`.toLowerCase().includes(lq) ||
        t.matieres.some(m => m.toLowerCase().includes(lq)) ||
        t.bio?.toLowerCase().includes(lq)
      );
    }

    res.json(tuteurs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
