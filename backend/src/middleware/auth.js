// Middleware d'authentification JWT.
// Vérifie le token Bearer dans le header Authorization et injecte req.user = { id, role }.
// Retourne 401 si le token est absent, invalide ou expiré.
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token manquant' });

  try {
    // slice(7) retire le préfixe "Bearer "
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
