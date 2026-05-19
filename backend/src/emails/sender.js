const nodemailer = require('nodemailer');

let _transporter = null;
let _smtpOk = false;

// ─── Initialisation SMTP avec vérification ─────────────────────────────────────
async function initEmail() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EMAIL] ⚠️  EMAIL_USER / EMAIL_PASS absents — mode console activé');
    console.warn('[EMAIL]    → Render : Settings → Environment → ajouter EMAIL_USER et EMAIL_PASS');
    return false;
  }

  // Brevo (smtp-relay.brevo.com) si EMAIL_HOST défini, sinon Gmail
  const transport = process.env.EMAIL_HOST
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      }
    : {
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      };

  const t = nodemailer.createTransport({
    ...transport,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await t.verify();
    _transporter = t;
    _smtpOk = true;
    console.log(`[EMAIL] ✅ SMTP Gmail opérationnel → ${process.env.EMAIL_USER}`);
    return true;
  } catch (err) {
    _transporter = null;
    _smtpOk = false;
    console.error(`[EMAIL] ❌ SMTP verify échoué : ${err.message}`);
    console.error(`[EMAIL]    EMAIL_USER = ${process.env.EMAIL_USER}`);
    console.error(`[EMAIL]    EMAIL_PASS = ${process.env.EMAIL_PASS ? '(défini, ' + process.env.EMAIL_PASS.length + ' chars)' : 'VIDE'}`);
    console.error('[EMAIL]    → Solution Gmail : Mon compte → Sécurité → Validation 2 étapes → Mots de passe des applications');
    console.error('[EMAIL]    → Le mot de passe d\'application fait 16 caractères (sans espaces)');
    return false;
  }
}

// ─── Envoi d'un email ──────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  // Transporter absent : affiche en console (dev / SMTP non configuré)
  if (!_transporter) {
    console.log('[EMAIL DEV] ══════════════════════════════════════');
    console.log(`[EMAIL DEV] To      : ${to}`);
    console.log(`[EMAIL DEV] Subject : ${subject}`);
    console.log('[EMAIL DEV] (email non envoyé — SMTP non configuré)');
    console.log('[EMAIL DEV] ══════════════════════════════════════');
    return { dev: true };
  }

  try {
    const info = await _transporter.sendMail({
      from: `"e-Tutorat Sénégal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      headers: {
        'X-Priority': '1',
        'X-Mailer': 'e-Tutorat/1.0',
      },
    });
    console.log(`[EMAIL] ✅ Envoyé → ${to} | id: ${info.messageId}`);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] ❌ Erreur envoi → ${to}`);
    console.error(`[EMAIL]    ${err.message}`);
    // Reset pour re-tenter verify au prochain appel
    _transporter = null;
    _smtpOk = false;
    // Re-init en arrière-plan
    initEmail().catch(() => {});
    throw err;
  }
}

// ─── Statut SMTP (pour /api/health) ───────────────────────────────────────────
function smtpStatus() {
  return {
    configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    ok: _smtpOk,
    user: process.env.EMAIL_USER || null,
  };
}

module.exports = { sendEmail, initEmail, smtpStatus };
