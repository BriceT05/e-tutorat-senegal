const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');
const { sendEmail } = require('../emails/sender');
const T = require('../emails/templates');
const { push } = require('../services/push');
const { sendSms } = require('../services/sms');
const validate = require('../middleware/validate');
const S = require('../schemas');

// ─── Helpers ───────────────────────────────────────────────────────────────────
const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => {
  const { password, resetToken, resetTokenExpiry, emailVerifyToken, ...rest } = u;
  return rest;
};

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Helper OTP : génère, stocke et envoie un code à 6 chiffres ────────────────
async function createAndSendOtp(user) {
  await prisma.$executeRaw`
    UPDATE login_otps SET used = true
    WHERE email = ${user.email} AND used = false
  `;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hashed = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await prisma.$executeRaw`
    INSERT INTO login_otps (id, email, code, "expiresAt")
    VALUES (gen_random_uuid(), ${user.email}, ${hashed}, ${expiresAt})
  `;
  Promise.all([
    sendEmail({
      to: user.email,
      subject: `${code} — Votre code de vérification e-Tutorat`,
      html: T.otpEmail({ prenom: user.prenom, code }),
    }),
    user.tel
      ? sendSms(user.tel, `e-Tutorat : votre code de vérification est ${code}. Valable 5 minutes.`)
      : Promise.resolve(),
  ]).catch(err => console.error('[OTP SEND]', err));
}

// ─── Rate limiting in-memory ────────────────────────────────────────────────────
const _rl = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = `${req.ip}|${req.path}`;
    const now = Date.now();
    const e = _rl.get(key);
    if (!e || now - e.t > windowMs) {
      _rl.set(key, { n: 1, t: now });
      return next();
    }
    if (e.n >= max) {
      return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' });
    }
    e.n++;
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _rl) if (now - v.t > 30 * 60 * 1000) _rl.delete(k);
}, 10 * 60 * 1000);

// ─── POST /api/auth/register ────────────────────────────────────────────────────
router.post('/register', rateLimit(10, 60 * 60 * 1000), validate(S.registerSchema), async (req, res) => {
  try {
    const { prenom, nom, email, password, role, ...profile } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        prenom, nom, email,
        password: hash,
        role: role.toUpperCase(),
        ...profile,
        matieres: profile.matieres || [],
        niveaux: profile.niveaux || [],
      },
    });

    const welcomeNotif = await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'system',
        emoji: '🎉',
        title: 'Bienvenue sur e-Tutorat !',
        body: 'Votre compte est créé. Entrez le code reçu pour l\'activer.',
      },
    });
    push(user.id, welcomeNotif);

    sendEmail({
      to: email,
      subject: `Bienvenue sur e-Tutorat Sénégal, ${prenom} ! 🎉`,
      html: T.welcomeEmail({ prenom, role: user.role }),
    }).catch(err => console.error('[EMAIL WELCOME]', err));

    await createAndSendOtp(user);

    res.status(201).json({ needsVerification: true, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login', rateLimit(10, 15 * 60 * 1000), validate(S.loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    if (!user.emailVerified) {
      await createAndSendOtp(user);
      return res.status(403).json({
        error: 'Veuillez vérifier votre email. Un code de vérification vous a été envoyé.',
        needsVerification: true,
        email: user.email,
      });
    }

    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/otp/send — Envoyer un code OTP ─────────────────────────────
router.post('/otp/send', rateLimit(5, 15 * 60 * 1000), validate(S.otpSendSchema), async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ ok: true });

    await prisma.$executeRaw`
      UPDATE login_otps SET used = true
      WHERE email = ${email} AND used = false
    `;

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.$executeRaw`
      INSERT INTO login_otps (id, email, code, "expiresAt")
      VALUES (gen_random_uuid(), ${email}, ${hashed}, ${expiresAt})
    `;

    Promise.all([
      sendEmail({
        to: email,
        subject: `${code} — Votre code de connexion e-Tutorat`,
        html: T.otpEmail({ prenom: user.prenom, code }),
      }),
      user.tel
        ? sendSms(user.tel, `e-Tutorat : votre code est ${code}. Valable 5 minutes.`)
        : Promise.resolve(),
    ]).catch(err => console.error('[OTP SEND]', err));

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/otp/verify — Vérifier le code OTP ──────────────────────────
router.post('/otp/verify', rateLimit(10, 15 * 60 * 1000), validate(S.otpVerifySchema), async (req, res) => {
  try {
    const { email, code } = req.body;

    const rows = await prisma.$queryRaw`
      SELECT * FROM login_otps
      WHERE email = ${email}
        AND used = false
        AND "expiresAt" > NOW()
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    const otp = rows[0];
    if (!otp) return res.status(400).json({ error: 'Code invalide ou expiré' });

    if (otp.attempts >= 5) {
      await prisma.$executeRaw`
        UPDATE login_otps SET used = true WHERE id = ${otp.id}
      `;
      return res.status(429).json({ error: 'Trop de tentatives, demandez un nouveau code' });
    }

    const valid = await bcrypt.compare(String(code), otp.code);
    if (!valid) {
      await prisma.$executeRaw`
        UPDATE login_otps SET attempts = attempts + 1 WHERE id = ${otp.id}
      `;
      return res.status(401).json({ error: 'Code incorrect' });
    }

    await prisma.$executeRaw`
      UPDATE login_otps SET used = true WHERE id = ${otp.id}
    `;

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(safeUser(user));
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────────
router.post('/forgot-password', rateLimit(5, 15 * 60 * 1000), validate(S.forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'Si cet email est enregistré, un lien a été envoyé.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${frontendUrl()}?reset=${token}`;
    sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe — e-Tutorat Sénégal',
      html: T.resetPasswordEmail({ prenom: user.prenom, url: resetUrl }),
    }).catch(err => console.error('[EMAIL RESET]', err));

    res.json({ message: 'Si cet email est enregistré, un lien a été envoyé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/reset-password ──────────────────────────────────────────────
router.post('/reset-password', validate(S.resetPasswordSchema), async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré' });

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/auth/verify-email ─────────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token manquant' });

    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) return res.status(400).json({ error: 'Lien invalide ou déjà utilisé' });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    res.json({ message: 'Email vérifié avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/resend-verify ───────────────────────────────────────────────
router.post('/resend-verify', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (user.emailVerified) return res.json({ message: 'Email déjà vérifié' });

    await createAndSendOtp(user);
    res.json({ message: 'Code de vérification renvoyé !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
