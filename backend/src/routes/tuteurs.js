// Route publique de listing et recherche des tuteurs.
// Accessible sans authentification pour que les visiteurs puissent parcourir les profils.
const router = require('express').Router();
const prisma = require('../prisma');
const { Prisma } = require('@prisma/client');

// GET /api/tuteurs?matiere=&region=&niveau=&mode=&tarifMax=&q=
// Tous les filtres, y compris la recherche texte libre (q), sont appliqués en SQL.
// q utilise ILIKE sur les colonnes scalaires + unnest() pour les tableaux matieres.
router.get('/', async (req, res) => {
  try {
    const { matiere, region, niveau, mode, tarifMax, q } = req.query;

    const conds = [
      Prisma.sql`role = 'TUTEUR'::"Role"`,
      Prisma.sql`verifie = true`,
    ];
    if (region)   conds.push(Prisma.sql`region = ${region}`);
    if (mode)     conds.push(Prisma.sql`"modeCours" = ${mode}`);
    if (tarifMax) conds.push(Prisma.sql`tarif <= ${parseInt(tarifMax, 10)}`);
    if (matiere)  conds.push(Prisma.sql`${matiere} = ANY(matieres)`);
    if (niveau)   conds.push(Prisma.sql`${niveau} = ANY(niveaux)`);
    if (q) {
      const p = `%${q}%`;
      conds.push(Prisma.sql`(
        prenom ILIKE ${p} OR nom ILIKE ${p}
        OR COALESCE(bio, '') ILIKE ${p}
        OR COALESCE(region, '') ILIKE ${p}
        OR EXISTS (SELECT 1 FROM unnest(matieres) m(val) WHERE val ILIKE ${p})
      )`);
    }

    const tuteurs = await prisma.$queryRaw`
      SELECT id, prenom, nom, photo, region, bio, diplome, matieres, niveaux,
             tarif, "modeCours", "noteAvg", "nbAvis", "createdAt",
             experience, methodologie, disponibilites,
             "tauxReponse", "delaiReponse", "totalEleves", langues, formations
      FROM users
      WHERE ${Prisma.join(conds, ' AND ')}
    `;

    res.json(tuteurs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
