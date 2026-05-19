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

function formatPhone(tel) {
  const d = String(tel).replace(/\D/g, '');
  if (d.startsWith('221')) return `+${d}`;
  if (d.length === 9) return `+221${d}`;
  return `+${d}`;
}

async function sendSms(to, body) {
  const number = formatPhone(to);
  if (!client) {
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
