// Point d'entrée du serveur Node.js — charge les variables d'env puis démarre Express.
// Ce fichier est séparé de app.js pour permettre les tests sans démarrer un vrai serveur.
require('dotenv').config();
const app = require('./app');
const { initEmail } = require('./emails/sender');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API e-Tutorat → http://localhost:${PORT}`);
  // Vérification non bloquante : si Brevo n'est pas configuré, l'app continue en mode console
  initEmail().catch(() => {});
});
