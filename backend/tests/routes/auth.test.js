const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── Mocks (hoisted avant tous les require) ───────────────────────────────────

jest.mock('../../src/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  notification: { create: jest.fn() },
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn(),
}));

jest.mock('../../src/emails/sender', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  smtpStatus: jest.fn().mockReturnValue('ok'),
}));

jest.mock('../../src/services/push', () => ({
  push: jest.fn(),
}));

// ─── Setup ───────────────────────────────────────────────────────────────────

const app = require('../../src/app');
const prisma = require('../../src/prisma');

// Hash pré-calculé pour 'Secret123!' (rounds=4 pour la vitesse en tests)
const HASHED = bcrypt.hashSync('Secret123!', 4);

const makeToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

const fakeUser = (overrides = {}) => ({
  id: 'user-001',
  prenom: 'Fatou',
  nom: 'Diallo',
  email: 'fatou@test.com',
  role: 'ELEVE',
  password: HASHED,
  resetToken: null,
  resetTokenExpiry: null,
  emailVerifyToken: 'verify-tok-123',
  emailVerified: false,
  matieres: [],
  niveaux: [],
  ...overrides,
});

const VALID_BODY = {
  prenom: 'Fatou',
  nom: 'Diallo',
  email: 'fatou@test.com',
  password: 'Secret123!',
  role: 'ELEVE',
};

// ─── GET /api/health ──────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  test('returns { ok: true, env: "test" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.env).toBe('test');
  });
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('body incomplet → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('email invalide → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_BODY, email: 'pas-un-email' });
    expect(res.status).toBe(400);
  });

  test('rôle ADMIN refusé à l\'inscription → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...VALID_BODY, role: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  test('email déjà pris → 409', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(fakeUser());
    const res = await request(app)
      .post('/api/auth/register')
      .send(VALID_BODY);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email déjà utilisé');
  });

  test('inscription valide → 201 avec needsVerification (flux OTP)', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.create.mockResolvedValueOnce(fakeUser());
    prisma.notification.create.mockResolvedValueOnce({ id: 'notif-1' });

    const res = await request(app)
      .post('/api/auth/register')
      .send(VALID_BODY);

    expect(res.status).toBe(201);
    expect(res.body.needsVerification).toBe(true);
    expect(res.body.email).toBe('fatou@test.com');
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('email inconnu → 401', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.com', password: 'anything' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Email ou mot de passe incorrect');
  });

  test('mauvais mot de passe → 401', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(fakeUser());
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fatou@test.com', password: 'MauvaisMotDePasse!' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Email ou mot de passe incorrect');
  });

  test('identifiants corrects → 200 avec token + user sans données sensibles', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(fakeUser({ emailVerified: true }));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fatou@test.com', password: 'Secret123!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.id).toBe('user-001');
    expect(res.body.user.password).toBeUndefined();
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  test('sans token → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token manquant');
  });

  test('token invalide → 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  test('token valide → 200 avec user sans données sensibles', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(fakeUser());
    const token = makeToken({ id: 'user-001', role: 'ELEVE' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('user-001');
    expect(res.body.prenom).toBe('Fatou');
    expect(res.body.password).toBeUndefined();
  });
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  test('email inconnu → 200 réponse générique (pas de fuite d\'info)', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'inconnu@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Si cet email/);
  });

  test('email existant → resetToken mis à jour, même réponse générique', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', prenom: 'Fatou', email: 'fatou@test.com' });
    prisma.user.update.mockResolvedValueOnce({});
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'fatou@test.com' });
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'fatou@test.com' } })
    );
    expect(res.body.message).toMatch(/Si cet email/);
  });
});
