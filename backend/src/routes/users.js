// Routes de gestion du profil utilisateur (lecture publique, modification protégée).
const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { userUpdateSchema } = require('../schemas');

// Retire le mot de passe hashé avant de sérialiser l'utilisateur dans la réponse
const safeUser = (u) => { const { password, ...rest } = u; return rest; };

// GET /api/users/:id — profil public (accessible sans authentification pour les pages tuteurs)
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(safeUser(user));
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id — mise à jour du profil (propriétaire seulement, vérifié côté serveur)
router.put('/:id', auth, validate(userUpdateSchema), async (req, res) => {
  try {
    // Vérification que l'utilisateur ne modifie que son propre profil, même si le token est valide
    if (req.user.id !== req.params.id)
      return res.status(403).json({ error: 'Accès refusé' });

    const data = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });

    res.json(safeUser(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
