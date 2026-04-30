const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = require('../prisma');

const sign = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const safeUser = (u) => {
  const { password, resetToken, resetTokenExpiry, emailVerifyToken, ...rest } = u;
  return rest;
};

async function sendVerifyEmail(prenom, email, verifyUrl) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n[VÉRIFICATION EMAIL] Lien pour ${email} :\n${verifyUrl}\n`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"e-Tutorat Sénégal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Vérifiez votre adresse email — e-Tutorat',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:40px 24px;background:#FFFDF5;border-radius:16px">
        <div style="text-align:center;margin-bottom:32px">
          <div style="display:inline-block;background:#F97316;border-radius:12px;padding:12px 20px">
            <span style="color:#fff;font-size:1.4rem;font-weight:900">e-Tutorat Sénégal 🇸🇳</span>
          </div>
        </div>
        <h2 style="color:#3E2A1F;font-size:1.5rem;margin:0 0 12px">Bienvenue ${prenom} !</h2>
        <p style="color:#524036;line-height:1.7;margin:0 0 24px">
          Votre compte est créé. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${verifyUrl}" style="display:inline-block;padding:16px 40px;background:#F97316;color:#fff;border-radius:100px;font-weight:800;font-size:1.05rem;text-decoration:none">
            Vérifier mon email
          </a>
        </div>
        <p style="color:#6B7280;font-size:0.85rem;line-height:1.6;margin:0">
          Si vous n'avez pas créé de compte, ignorez cet email.<br>
          Lien : <a href="${verifyUrl}" style="color:#F97316">${verifyUrl}</a>
        </p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #E9D5A0">
        <p style="color:#6B7280;font-size:0.8rem;text-align:center;margin:0">e-Tutorat Sénégal — Le tutorat de qualité pour tous 📚</p>
      </div>
    `,
  });
}

async function sendResetEmail(prenom, email, resetUrl) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n[RESET MOT DE PASSE] Lien pour ${email} :\n${resetUrl}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"e-Tutorat Sénégal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe — e-Tutorat',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:40px 24px;background:#FFFDF5;border-radius:16px">
        <div style="text-align:center;margin-bottom:32px">
          <div style="display:inline-block;background:#F97316;border-radius:12px;padding:12px 20px">
            <span style="color:#fff;font-size:1.4rem;font-weight:900">e-Tutorat Sénégal 🇸🇳</span>
          </div>
        </div>
        <h2 style="color:#3E2A1F;font-size:1.5rem;margin:0 0 12px">Bonjour ${prenom} !</h2>
        <p style="color:#524036;line-height:1.7;margin:0 0 24px">
          Vous avez demandé la réinitialisation de votre mot de passe.<br>
          Cliquez sur le bouton ci-dessous — ce lien expire dans <strong>1 heure</strong>.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="display:inline-block;padding:16px 40px;background:#F97316;color:#fff;border-radius:100px;font-weight:800;font-size:1.05rem;text-decoration:none">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color:#6B7280;font-size:0.85rem;line-height:1.6;margin:0">
          Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.<br>
          Lien : <a href="${resetUrl}" style="color:#F97316">${resetUrl}</a>
        </p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #E9D5A0">
        <p style="color:#6B7280;font-size:0.8rem;text-align:center;margin:0">e-Tutorat Sénégal — Le tutorat de qualité pour tous 📚</p>
      </div>
    `,
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
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

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'system',
        emoji: '🎉',
        title: 'Bienvenue sur e-Tutorat !',
        body: 'Votre compte est créé. Vérifiez votre email pour activer votre compte.',
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?verify=${verifyToken}`;
    await sendVerifyEmail(prenom, email, verifyUrl);

    res.status(201).json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
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

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(safeUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Réponse générique pour ne pas révéler si l'email existe
    if (!user) return res.json({ message: 'Si cet email est enregistré, un lien a été envoyé.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?reset=${token}`;
    await sendResetEmail(user.prenom, email, resetUrl);

    res.json({ message: 'Si cet email est enregistré, un lien a été envoyé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token et mot de passe requis' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
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

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token manquant' });

  try {
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

// POST /api/auth/resend-verify
router.post('/resend-verify', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (user.emailVerified) return res.json({ message: 'Email déjà vérifié' });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: verifyToken } });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?verify=${verifyToken}`;
    await sendVerifyEmail(user.prenom, user.email, verifyUrl);

    res.json({ message: 'Email de vérification renvoyé !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
