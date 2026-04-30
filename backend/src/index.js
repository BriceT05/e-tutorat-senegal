require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' })); // 10mb pour les photos base64

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
