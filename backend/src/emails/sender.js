const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return _transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`\n[EMAIL DEV] To: ${to} | Subject: ${subject}\n`);
    return;
  }
  try {
    await t.sendMail({
      from: `"e-Tutorat Sénégal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Ne bloque pas le flux principal si l'email échoue
    console.error(`[EMAIL ERROR] ${to}: ${err.message}`);
  }
}

module.exports = { sendEmail };
