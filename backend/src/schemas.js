// Schémas de validation Zod partagés entre les routes et les middlewares.
// Chaque schéma est utilisé via le middleware validate() pour valider req.body
// avant que la logique métier ne soit exécutée.
const { z } = require('zod');

// ─── Primitives réutilisables ─────────────────────────────────────────────────
const str    = (max = 500) => z.string().trim().min(1).max(max);
const optStr = (max = 500) => z.string().trim().max(max).optional().nullable();
// max(254) respecte la limite RFC 5321 des adresses email
const email  = z.string().trim().toLowerCase().email('Email invalide').max(254);
const pwd    = z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128);
const uuid   = z.string().uuid('Identifiant invalide');

// Coerce les champs numériques venant d'un <input type="number"> (string → number)
const coerceInt = (min = 0, max = 10_000_000) =>
  z.preprocess(
    v => (v === '' || v == null ? null : Number(v)),
    z.number().int().min(min).max(max).nullable().optional()
  );

// ─── Auth ─────────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  prenom:       str(60).min(1, 'Prénom requis'),
  nom:          str(60).min(1, 'Nom requis'),
  email,
  password:     pwd,
  role:         z.preprocess(v => String(v || '').toUpperCase(), z.enum(['ELEVE', 'TUTEUR'], { errorMap: () => ({ message: 'Rôle invalide' }) })),
  // Champs communs
  region:       optStr(100),
  tel:          optStr(20),
  whatsapp:     optStr(20),
  photo:        optStr(500),
  // Champs élève
  niveau:       optStr(100),
  typeCours:    optStr(100),
  budget:       optStr(100),
  // Champs tuteur
  bio:          optStr(2000),
  diplome:      optStr(200),
  tarif:        coerceInt(0, 1_000_000),
  modeCours:    optStr(100),
  experience:   optStr(2000),
  methodologie: optStr(2000),
  matieres:     z.array(str(100)).max(20).optional().default([]),
  niveaux:      z.array(str(100)).max(20).optional().default([]),
  langues:      z.array(str(100)).max(10).optional().default([]),
  formations:   z.array(str(300)).max(20).optional().default([]),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis').max(128),
});

const otpSendSchema   = z.object({ email });

const otpVerifySchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, 'Code à 6 chiffres requis'),
});

const forgotPasswordSchema = z.object({ email });

const resetPasswordSchema = z.object({
  token:    z.string().min(1, 'Token requis'),
  password: pwd,
});

// ─── Users ────────────────────────────────────────────────────────────────────
const userUpdateSchema = z.object({
  prenom:         optStr(60),
  nom:            optStr(60),
  tel:            optStr(20),
  whatsapp:       optStr(20),
  region:         optStr(100),
  photo:          optStr(500),
  // Élève
  niveau:         optStr(100),
  typeCours:      optStr(100),
  budget:         optStr(100),
  // Tuteur
  bio:            optStr(2000),
  diplome:        optStr(200),
  tarif:          coerceInt(0, 1_000_000),
  modeCours:      optStr(100),
  experience:     optStr(2000),
  methodologie:   optStr(2000),
  disponibilites: z.object({
    Lundi: z.array(z.boolean()).length(7),
    Mardi: z.array(z.boolean()).length(7),
    Mercredi: z.array(z.boolean()).length(7),
    Jeudi: z.array(z.boolean()).length(7),
    Vendredi: z.array(z.boolean()).length(7),
    Samedi: z.array(z.boolean()).length(7),
    Dimanche: z.array(z.boolean()).length(7),
  }).optional().nullable(),
  tauxReponse:    z.number().int().min(0).max(100).optional().nullable(),
  delaiReponse:   optStr(100),
  totalEleves:    z.number().int().min(0).optional().nullable(),
  matieres:       z.array(str(100)).max(20).optional(),
  niveaux:        z.array(str(100)).max(20).optional(),
  langues:        z.array(str(100)).max(10).optional(),
  formations:     z.array(str(300)).max(20).optional(),
});

// ─── Requests ─────────────────────────────────────────────────────────────────
const requestCreateSchema = z.object({
  tuteurId: uuid,
  matiere:  str(100).min(1, 'Matière requise'),
  niveau:   optStr(100),
  jours:    z.array(str(25)).max(49).optional().default([]),
  duree:    optStr(50),
  mode:     optStr(50),
  message:  optStr(1000),
  tarif:    coerceInt(0, 1_000_000),
});

const requestUpdateSchema = z.object({
  status: z.enum(['CONFIRMEE', 'REFUSEE'], { errorMap: () => ({ message: 'Statut invalide' }) }),
});

// ─── Messages ─────────────────────────────────────────────────────────────────
const messageCreateSchema = z.object({
  text:           str(2000).min(1, 'Message vide'),
  conversationId: uuid.optional(),
  recipientId:    uuid.optional(),
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
const reviewCreateSchema = z.object({
  tuteurId:    uuid,
  note:        z.number().int().min(1, 'Note minimale : 1').max(5, 'Note maximale : 5'),
  commentaire: optStr(1000),
});

// ─── Articles (admin) ─────────────────────────────────────────────────────────
const CATEGORIES = ['conseils', 'bac', 'orientation', 'numerique', 'succes'];

const articleSchema = z.object({
  titre:    str(200).min(1, 'Titre requis'),
  slug:     z.string().trim().max(200).optional(),
  extrait:  optStr(500),
  contenu:  str(20_000).min(1, 'Contenu requis'),
  categorie: z.enum(CATEGORIES, { errorMap: () => ({ message: `Catégorie invalide (${CATEGORIES.join(', ')})` }) }),
  coverUrl: z.string().trim().url('URL invalide').max(500).optional().nullable().or(z.literal('')).transform(v => v || null),
  publie:   z.boolean().optional().default(false),
});

const articleUpdateSchema = articleSchema.partial();

// ─── Admin ────────────────────────────────────────────────────────────────────
const roleUpdateSchema = z.object({
  role: z.enum(['ELEVE', 'TUTEUR', 'ADMIN'], { errorMap: () => ({ message: 'Rôle invalide' }) }),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userUpdateSchema,
  requestCreateSchema,
  requestUpdateSchema,
  messageCreateSchema,
  reviewCreateSchema,
  articleSchema,
  articleUpdateSchema,
  roleUpdateSchema,
};
