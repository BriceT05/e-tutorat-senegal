// Service SMS via Twilio — utilisé pour envoyer les codes OTP par SMS.
// Si les variables d'env Twilio ne sont pas définies, le SMS est loggué en console (mode dev).
// Twilio est une dépendance optionnelle : l'app fonctionne sans lui.

let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch {
    console.warn('[SMS] Package twilio manquant — npm install twilio');
  }
}

// Normalise un numéro sénégalais au format E.164 (+221XXXXXXXXX).
// Accepte : "77 123 45 67", "221771234567", "+221771234567", etc.
function formatPhone(tel) {
  const d = String(tel).replace(/\D/g, '');
  if (d.startsWith('221')) return `+${d}`;
  if (d.length === 9) return `+221${d}`;    // numéro local sans indicatif
  return `+${d}`;
}

async function sendSms(to, body) {
  const number = formatPhone(to);
  if (!client) {
    // Mode développement : afficher le SMS dans la console au lieu de l'envoyer
    console.log(`[SMS DEV] → ${number} : ${body}`);
    return;
  }
  await client.messages.create({
    to: number,
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
}

module.exports = { sendSms };
