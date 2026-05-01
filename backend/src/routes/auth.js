const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');
const { sendEmail } = require('../emails/sender');
const T = require('../emails/templates');
const { push } = require('../services/push');

// ─── Helpers ───────────────────────────────────────────────────────────────────
const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => {
  const { password, resetToken, resetTokenExpiry, emailVerifyToken, ...rest } = u;
  return rest;
};

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

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
// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _rl) if (now - v.t > 30 * 60 * 1000) _rl.delete(k);
}, 10 * 60 * 1000);

// ─── POST /api/auth/register ────────────────────────────────────────────────────
router.post('/register', rateLimit(10, 60 * 60 * 1000), async (req, res) => {
  try {
    const { prenom, nom, email, password, role, ...profile } = req.body;

    if (!prenom || !nom || !email || !password || !role)
      return res.status(400).json({ error: 'Champs obligatoires manquants' });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        prenom, nom, email,
        password: hash,
        role: role.toUpperCase(),
        emailVerifyToken: verifyToken,
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
        body: 'Votre compte est créé. Vérifiez votre email pour l\'activer.',
      },
    });
    push(user.id, welcomeNotif);

    const verifyUrl = `${frontendUrl()}?verify=${verifyToken}`;

    // Email de bienvenue + email de vérification
    await Promise.all([
      sendEmail({
        to: email,
        subject: `Bienvenue sur e-Tutorat Sénégal, ${prenom} ! 🎉`,
        html: T.welcomeEmail({ prenom, role: user.role }),
      }),
      sendEmail({
        to: email,
        subject: 'Vérifiez votre adresse email — e-Tutorat Sénégal',
        html: T.verifyEmail({ prenom, url: verifyUrl }),
      }),
    ]);

    res.status(201).json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/otp/send — Envoyer un code OTP ─────────────────────────────
router.post('/otp/send', rateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ error: 'Email invalide' });

    const user = await prisma.user.findUnique({ where: { email } });
    // Réponse générique même si l'email n'existe pas (sécurité)
    if (!user) return res.json({ ok: true });

    // Invalider les anciens OTP pour cet email
    await prisma.$executeRaw`
      UPDATE login_otps SET used = true
      WHERE email = ${email} AND used = false
    `;

    // Générer le code à 6 chiffres
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.$executeRaw`
      INSERT INTO login_otps (id, email, code, "expiresAt")
      VALUES (gen_random_uuid(), ${email}, ${hashed}, ${expiresAt})
    `;

    await sendEmail({
      to: email,
      subject: `${code} — Votre code de connexion e-Tutorat`,
      html: T.otpEmail({ prenom: user.prenom, code }),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/otp/verify — Vérifier le code OTP ──────────────────────────
router.post('/otp/verify', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email et code requis' });

    // Récupérer le dernier OTP valide pour cet email
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

    // Limiter les tentatives (max 5 par OTP)
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

    // Invalider l'OTP
    await prisma.$executeRaw`
      UPDATE login_otps SET used = true WHERE id = ${otp.id}
    `;

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
router.post('/forgot-password', rateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'Si cet email est enregistré, un lien a été envoyé.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${frontendUrl()}?reset=${token}`;
    await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe — e-Tutorat Sénégal',
      html: T.resetPasswordEmail({ prenom: user.prenom, url: resetUrl }),
    });

    res.json({ message: 'Si cet email est enregistré, un lien a été envoyé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/reset-password ──────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token et mot de passe requis' });
    if (password.length < 8) return res.status(400).json({ error: 'Minimum 8 caractères' });

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

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: verifyToken } });

    const verifyUrl = `${frontendUrl()}?verify=${verifyToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Vérifiez votre adresse email — e-Tutorat Sénégal',
      html: T.verifyEmail({ prenom: user.prenom, url: verifyUrl }),
    });

    res.json({ message: 'Email de vérification renvoyé !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
