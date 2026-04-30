const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const safeUser = (u) => { const { password, ...rest } = u; return rest; };

// GET /api/users/:id — profil public (pour la liste tuteurs)
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(safeUser(user));
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id — mise à jour du profil (propriétaire seulement)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ error: 'Accès refusé' });

    const { password, email, role, id, createdAt, ...data } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...data,
        matieres:   data.matieres   ?? undefined,
        niveaux:    data.niveaux    ?? undefined,
        langues:    data.langues    ?? undefined,
        formations: data.formations ?? undefined,
      },
    });

    res.json(safeUser(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
