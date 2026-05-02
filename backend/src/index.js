require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/frontend(-[a-z0-9]+-bricet05s-projects\.vercel\.app|(-alpha-seven-25)?\.vercel\.app)$/.test(origin) ||
      origin === 'https://www.etutorat.sn' ||
      origin === 'https://etutorat.sn'
    ) return cb(null, true);
    cb(new Error('CORS: origine non autorisée'));
  },
  credentials: true,
};

// Gestion explicite des preflight OPTIONS (nécessaire avec credentials + JSON)
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Log chaque requête pour diagnostic
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} | origin: ${req.headers.origin || '—'}`);
  next();
});

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/tuteurs',       require('./routes/tuteurs'));
app.use('/api/requests',      require('./routes/requests'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',        require('./routes/admin'));

app.get('/api/health', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ API e-Tutorat → http://localhost:${PORT}`));
