const express = require('express');
const cors = require('cors');

const app = express();

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
    if (!origin) return cb(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/[a-z0-9-]+-bricet05s-projects\.vercel\.app$/.test(origin)
    ) return cb(null, true);
    console.warn('[CORS] origine refusée :', origin);
    cb(new Error('CORS: origine non autorisée'));
  },
  credentials: true,
};

app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | origin: ${req.headers.origin || '—'}`);
  }
  next();
});

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/tuteurs',       require('./routes/tuteurs'));
app.use('/api/requests',      require('./routes/requests'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/articles',      require('./routes/articles'));

app.get('/api/health', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

module.exports = app;
