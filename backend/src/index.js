require('dotenv').config();
const app = require('./app');
const { initEmail } = require('./emails/sender');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API e-Tutorat → http://localhost:${PORT}`);
  initEmail().catch(() => {});
});
