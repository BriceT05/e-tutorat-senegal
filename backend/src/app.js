// Configuration centrale d'Express : CORS, JSON parsing, logging et montage des routes.
// Exporté comme module pour être importé dans index.js (prod) et dans les tests (Jest).
const express = require('express');
const cors = require('cors');

const app = express();

// Origines autorisées en prod + dev local.
// filter(Boolean) supprime FRONTEND_URL si la variable d'env n'est pas définie.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://e-tutorat.vercel.app',
  'https://www.etutorat.sn',
  'https://etutorat.sn',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // Les appels sans origin (Postman, curl, SSR) sont autorisés
    if (!origin) return cb(null, true);
    // Le pattern regex autorise les previews Vercel dynamiques du compte bricet05s
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/[a-z0-9-]+-bricet05s-projects\.vercel\.app$/.test(origin)
    ) return cb(null, true);
    console.warn('[CORS] origine refusée :', origin);
    cb(new Error('CORS: origine non autorisée'));
  },
  // credentials: true est requis pour que le frontend puisse envoyer les cookies
  credentials: true,
};

// Préflight OPTIONS doit passer avant tout middleware d'auth
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
// Limite à 10 Mo pour les photos encodées en base64 dans le body
app.use(express.json({ limit: '10mb' }));

// Logger HTTP minimal — désactivé en test pour ne pas polluer la sortie Jest
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | origin: ${req.headers.origin || '—'}`);
  }
  next();
});

// ─── Montage des routes ───────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/tuteurs',       require('./routes/tuteurs'));
app.use('/api/requests',      require('./routes/requests'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/articles',      require('./routes/articles'));

// Endpoint de santé utilisé par le frontend pour "réveiller" le backend Render (cold start)
app.get('/api/health', (_, res) => {
  const { smtpStatus } = require('./emails/sender');
  res.json({ ok: true, env: process.env.NODE_ENV, smtp: smtpStatus() });
});

module.exports = app;
