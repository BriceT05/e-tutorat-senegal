// Route publique de listing et recherche des tuteurs.
// Accessible sans authentification pour que les visiteurs puissent parcourir les profils.
const router = require('express').Router();
const prisma = require('../prisma');

// GET /api/tuteurs?matiere=&region=&niveau=&mode=&tarifMax=&q=
// Les filtres structurés (matiere, region, niveau, mode, tarifMax) sont appliqués en BDD.
// La recherche texte libre (q) est appliquée en mémoire après récupération, car Prisma
// ne supporte pas facilement la recherche dans les tableaux JSON (matieres, bio).
router.get('/', async (req, res) => {
  try {
    const { matiere, region, niveau, mode, tarifMax, q } = req.query;

    const where = { role: 'TUTEUR' };

    if (region)   where.region    = region;
    if (mode)     where.modeCours = mode;
    if (tarifMax) where.tarif     = { lte: parseInt(tarifMax) };
    // { has: value } est l'opérateur Prisma pour chercher dans un tableau PostgreSQL
    if (matiere)  where.matieres  = { has: matiere };
    if (niveau)   where.niveaux   = { has: niveau };

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

    // Filtre texte libre sur nom, matières et bio (insensible à la casse)
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
