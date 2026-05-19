// Routes d'authentification : inscription, connexion, OTP, reset mot de passe, vérification email.
// Toutes les routes sensibles sont protégées par un rate limiter in-memory.
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

// Génère un JWT valable 7 jours contenant l'id et le rôle de l'utilisateur
const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Retire les champs sensibles avant de renvoyer l'utilisateur au client
const safeUser = (u) => {
  const { password, resetToken, resetTokenExpiry, emailVerifyToken, ...rest } = u;
  return rest;
};

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Helper OTP : génère, stocke et envoie un code à 6 chiffres ────────────────
// On utilise des requêtes SQL brutes ($executeRaw) car la table login_otps n'est pas
// un modèle Prisma standard — elle gère les tentatives (attempts) et l'expiration.
async function createAndSendOtp(user) {
  // Invalider les codes précédents non utilisés pour cet email
  await prisma.$executeRaw`
    UPDATE login_otps SET used = true
    WHERE email = ${user.email} AND used = false
  `;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  // Stocker le hash du code, jamais le code en clair (protection en cas de fuite BDD)
  const hashed = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await prisma.$executeRaw`
    INSERT INTO login_otps (id, email, code, "expiresAt")
    VALUES (gen_random_uuid(), ${user.email}, ${hashed}, ${expiresAt})
  `;
  console.log(`[OTP] Code généré pour ${user.email} — expire dans 5 min`);

  // Envoi email + SMS en arrière-plan — ne pas await pour ne pas bloquer la réponse HTTP
  sendEmail({
    to: user.email,
    subject: `${code} — Votre code de vérification e-Tutorat`,
    html: T.otpEmail({ prenom: user.prenom, code }),
  }).catch(err => console.error(`[OTP] ❌ Email non envoyé à ${user.email}: ${err.message}`));

  if (user.tel) {
    sendSms(user.tel, `e-Tutorat : votre code de vérification est ${code}. Valable 5 minutes.`)
      .catch(err => console.error(`[OTP] ❌ SMS non envoyé à ${user.tel}: ${err.message}`));
  }
}

// ─── Rate limiting in-memory ────────────────────────────────────────────────────
// Solution légère sans Redis : clé = IP + chemin, compte les appels dans une fenêtre glissante.
// Nettoyage automatique toutes les 10 min pour éviter les fuites mémoire.
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
// Purge les entrées expirées (inactives depuis plus de 30 min)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of _rl) if (now - v.t > 30 * 60 * 1000) _rl.delete(k);
}, 10 * 60 * 1000);

// ─── POST /api/auth/register — 10 tentatives / heure ───────────────────────────
router.post('/register', rateLimit(10, 60 * 60 * 1000), validate(S.registerSchema), async (req, res) => {
  try {
    const { prenom, nom, email, password, role, ...profile } = req.body;

    // Unicité de l'email vérifiée applicativement en plus de la contrainte BDD
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

// ─── POST /api/auth/login — 10 tentatives / 15 min ─────────────────────────────
router.post('/login', rateLimit(10, 15 * 60 * 1000), validate(S.loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Message générique volontairement : ne pas indiquer si l'email existe en base
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    // Si l'email n'est pas encore vérifié, forcer la vérification OTP avant de donner le token
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

// ─── POST /api/auth/otp/send — Envoyer un code OTP — 5 tentatives / 15 min ─────
router.post('/otp/send', rateLimit(5, 15 * 60 * 1000), validate(S.otpSendSchema), async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Réponse identique si l'email n'existe pas (anti-énumération d'emails)
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

// ─── POST /api/auth/otp/verify — Vérifier le code OTP — 10 tentatives / 15 min ─
router.post('/otp/verify', rateLimit(10, 15 * 60 * 1000), validate(S.otpVerifySchema), async (req, res) => {
  try {
    const { email, code } = req.body;

    // $queryRaw est utilisé ici car login_otps n'est pas un modèle Prisma ;
    // le cast ::uuid est nécessaire pour que PostgreSQL accepte la comparaison avec l'id
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

    // Bloquer après 5 tentatives erronées pour prévenir le brute-force
    if (otp.attempts >= 5) {
      await prisma.$executeRaw`
        UPDATE login_otps SET used = true WHERE id = ${otp.id}::uuid
      `;
      return res.status(429).json({ error: 'Trop de tentatives, demandez un nouveau code' });
    }

    const valid = await bcrypt.compare(String(code), otp.code);
    if (!valid) {
      await prisma.$executeRaw`
        UPDATE login_otps SET attempts = attempts + 1 WHERE id = ${otp.id}::uuid
      `;
      return res.status(401).json({ error: 'Code incorrect' });
    }

    // Code valide : invalider immédiatement (usage unique)
    await prisma.$executeRaw`
      UPDATE login_otps SET used = true WHERE id = ${otp.id}::uuid
    `;

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, emailVerifyToken: null },
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    res.json({ token: sign(user), user: safeUser(user) });
  } catch (err) {
    console.error('[OTP VERIFY ERROR]', err);
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

// ─── POST /api/auth/forgot-password — 5 tentatives / 15 min ────────────────────
router.post('/forgot-password', rateLimit(5, 15 * 60 * 1000), validate(S.forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Réponse identique si l'email n'existe pas (anti-énumération d'emails)
    if (!user) return res.json({ message: 'Si cet email est enregistré, un lien a été envoyé.' });

    // Token cryptographiquement sécurisé de 64 caractères hex, valable 1 heure
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
