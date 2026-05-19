// Service d'envoi d'emails via l'API HTTP Brevo (ex-Sendinblue).
// Nous utilisons l'API HTTP plutôt que nodemailer+SMTP car le port 587
// est bloqué sur Render (hébergeur gratuit). fetch() contourne cette limitation.

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_ACCOUNT_URL = 'https://api.brevo.com/v3/account';

// État global de la connexion Brevo, initialisé au démarrage du serveur
let _ok = false;
let _error = null;

// Vérifie que la clé API Brevo est valide au démarrage.
// En cas d'échec, l'application continue mais les emails sont loggués en console.
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

// Envoie un email HTML via Brevo. Lance une exception si Brevo renvoie une erreur HTTP.
// Si Brevo n'est pas configuré (_ok === false), simule l'envoi en console (mode dev).
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
  // sans quoi les caractères comme "é" ou "ç" peuvent être corrompus côté Brevo
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
      // Content-Length explicite requis pour que Brevo accepte le Buffer
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

// Retourne l'état de la connexion email — exposé dans GET /api/health
function smtpStatus() {
  return {
    configured: !!process.env.BREVO_API_KEY,
    ok: _ok,
    from: process.env.EMAIL_FROM || null,
    error: _error || undefined,
  };
}

module.exports = { sendEmail, initEmail, smtpStatus };
