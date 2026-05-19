const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_ACCOUNT_URL = 'https://api.brevo.com/v3/account';

let _ok = false;
let _error = null;

async function initEmail() {
  if (!process.env.BREVO_API_KEY) {
    console.warn('[EMAIL] ⚠️  BREVO_API_KEY absent — mode console activé');
    return false;
  }

  try {
    const resp = await fetch(BREVO_ACCOUNT_URL, {
      headers: { 'api-key': process.env.BREVO_API_KEY },
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    const data = await resp.json();
    _ok = true;
    _error = null;
    console.log(`[EMAIL] ✅ Brevo API opérationnel → ${data.email}`);
    return true;
  } catch (err) {
    _ok = false;
    _error = err.message;
    console.error(`[EMAIL] ❌ Brevo API verify échoué : ${err.message}`);
    return false;
  }
}

async function sendEmail({ to, subject, html }) {
  if (!_ok) {
    console.log('[EMAIL DEV] ══════════════════════════════════════');
    console.log(`[EMAIL DEV] To      : ${to}`);
    console.log(`[EMAIL DEV] Subject : ${subject}`);
    console.log('[EMAIL DEV] (email non envoyé — Brevo non configuré)');
    console.log('[EMAIL DEV] ══════════════════════════════════════');
    return { dev: true };
  }

  const fromEmail = process.env.EMAIL_FROM || 'etutorat2026@gmail.com';

  // Buffer.from(..., 'utf8') garantit l'encodage UTF-8 explicite du payload JSON
  const payload = Buffer.from(
    JSON.stringify({
      sender: { name: 'e-Tutorat Sénégal', email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    'utf8'
  );

  const resp = await fetch(BREVO_SEND_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': String(payload.length),
    },
    body: payload,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`[EMAIL] ❌ Erreur envoi → ${to} : HTTP ${resp.status} ${errText}`);
    throw new Error(`Brevo API ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  console.log(`[EMAIL] ✅ Envoyé → ${to} | id: ${data.messageId}`);
  return { ok: true, messageId: data.messageId };
}

function smtpStatus() {
  return {
    configured: !!process.env.BREVO_API_KEY,
    ok: _ok,
    from: process.env.EMAIL_FROM || null,
    error: _error || undefined,
  };
}

module.exports = { sendEmail, initEmail, smtpStatus };
