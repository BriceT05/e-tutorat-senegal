const {
  registerSchema, loginSchema, otpVerifySchema, forgotPasswordSchema, resetPasswordSchema,
  userUpdateSchema, requestCreateSchema, requestUpdateSchema,
  messageCreateSchema, reviewCreateSchema, articleSchema, roleUpdateSchema,
} = require('../src/schemas');

// ─── registerSchema ───────────────────────────────────────────────────────────
describe('registerSchema', () => {
  const valid = {
    prenom: 'Fatou', nom: 'Diallo',
    email: 'fatou@example.com', password: 'Secret123!',
    role: 'ELEVE',
  };

  test('valid input passes', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  test('role uppercased from lowercase (eleve → ELEVE)', () => {
    const r = registerSchema.safeParse({ ...valid, role: 'eleve' });
    expect(r.success).toBe(true);
    expect(r.data.role).toBe('ELEVE');
  });

  test('role TUTEUR accepted', () => {
    expect(registerSchema.safeParse({ ...valid, role: 'TUTEUR' }).success).toBe(true);
  });

  test('ADMIN role rejected', () => {
    expect(registerSchema.safeParse({ ...valid, role: 'ADMIN' }).success).toBe(false);
  });

  test('missing email fails', () => {
    const { email: _, ...rest } = valid;
    expect(registerSchema.safeParse(rest).success).toBe(false);
  });

  test('invalid email fails', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  test('email is lowercased', () => {
    const r = registerSchema.safeParse({ ...valid, email: 'FATOU@EXAMPLE.COM' });
    expect(r.success).toBe(true);
    expect(r.data.email).toBe('fatou@example.com');
  });

  test('password shorter than 8 chars fails', () => {
    expect(registerSchema.safeParse({ ...valid, password: '1234567' }).success).toBe(false);
  });

  test('prenom exceeding 60 chars fails', () => {
    expect(registerSchema.safeParse({ ...valid, prenom: 'A'.repeat(61) }).success).toBe(false);
  });

  test('matieres defaults to []', () => {
    const r = registerSchema.safeParse(valid);
    expect(r.data.matieres).toEqual([]);
  });

  test('tarif coerced from string', () => {
    const r = registerSchema.safeParse({ ...valid, tarif: '5000' });
    expect(r.success).toBe(true);
    expect(r.data.tarif).toBe(5000);
  });

  test('empty tarif string becomes null', () => {
    const r = registerSchema.safeParse({ ...valid, tarif: '' });
    expect(r.success).toBe(true);
    expect(r.data.tarif).toBeNull();
  });

  test('matieres array max 20 enforced', () => {
    const matieres = Array.from({ length: 21 }, (_, i) => `Matière${i}`);
    expect(registerSchema.safeParse({ ...valid, matieres }).success).toBe(false);
  });

  test('unknown fields are stripped', () => {
    const r = registerSchema.safeParse({ ...valid, hacker: 'malicious' });
    expect(r.success).toBe(true);
    expect(r.data.hacker).toBeUndefined();
  });
});

// ─── loginSchema ──────────────────────────────────────────────────────────────
describe('loginSchema', () => {
  test('valid credentials pass', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'pass' }).success).toBe(true);
  });

  test('missing email fails', () => {
    expect(loginSchema.safeParse({ password: 'pass' }).success).toBe(false);
  });

  test('missing password fails', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
  });

  test('invalid email format fails', () => {
    expect(loginSchema.safeParse({ email: 'not-email', password: 'pass' }).success).toBe(false);
  });
});

// ─── otpVerifySchema ──────────────────────────────────────────────────────────
describe('otpVerifySchema', () => {
  test('valid 6-digit code passes', () => {
    expect(otpVerifySchema.safeParse({ email: 'a@b.com', code: '123456' }).success).toBe(true);
  });

  test('5-digit code fails', () => {
    expect(otpVerifySchema.safeParse({ email: 'a@b.com', code: '12345' }).success).toBe(false);
  });

  test('7-digit code fails', () => {
    expect(otpVerifySchema.safeParse({ email: 'a@b.com', code: '1234567' }).success).toBe(false);
  });

  test('non-numeric code fails', () => {
    expect(otpVerifySchema.safeParse({ email: 'a@b.com', code: 'abcdef' }).success).toBe(false);
  });
});

// ─── reviewCreateSchema ───────────────────────────────────────────────────────
describe('reviewCreateSchema', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  test('note 1 is minimum', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: validId, note: 1 }).success).toBe(true);
  });

  test('note 5 is maximum', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: validId, note: 5 }).success).toBe(true);
  });

  test('note 0 fails', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: validId, note: 0 }).success).toBe(false);
  });

  test('note 6 fails', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: validId, note: 6 }).success).toBe(false);
  });

  test('non-integer note fails', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: validId, note: 3.5 }).success).toBe(false);
  });

  test('non-uuid tuteurId fails', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: 'not-a-uuid', note: 3 }).success).toBe(false);
  });

  test('commentaire over 1000 chars fails', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: validId, note: 3, commentaire: 'x'.repeat(1001) }).success).toBe(false);
  });

  test('commentaire is optional', () => {
    expect(reviewCreateSchema.safeParse({ tuteurId: validId, note: 3 }).success).toBe(true);
  });
});

// ─── requestUpdateSchema ──────────────────────────────────────────────────────
describe('requestUpdateSchema', () => {
  test('CONFIRMEE passes', () => {
    expect(requestUpdateSchema.safeParse({ status: 'CONFIRMEE' }).success).toBe(true);
  });

  test('REFUSEE passes', () => {
    expect(requestUpdateSchema.safeParse({ status: 'REFUSEE' }).success).toBe(true);
  });

  test('EN_ATTENTE is rejected (cannot set back to pending)', () => {
    expect(requestUpdateSchema.safeParse({ status: 'EN_ATTENTE' }).success).toBe(false);
  });

  test('arbitrary string fails', () => {
    expect(requestUpdateSchema.safeParse({ status: 'ACCEPTED' }).success).toBe(false);
  });
});

// ─── messageCreateSchema ──────────────────────────────────────────────────────
describe('messageCreateSchema', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  test('text with conversationId passes', () => {
    expect(messageCreateSchema.safeParse({ text: 'Bonjour', conversationId: validId }).success).toBe(true);
  });

  test('text with recipientId passes', () => {
    expect(messageCreateSchema.safeParse({ text: 'Bonjour', recipientId: validId }).success).toBe(true);
  });

  test('empty text fails', () => {
    expect(messageCreateSchema.safeParse({ text: '', recipientId: validId }).success).toBe(false);
  });

  test('text over 2000 chars fails', () => {
    expect(messageCreateSchema.safeParse({ text: 'x'.repeat(2001), recipientId: validId }).success).toBe(false);
  });

  test('non-uuid conversationId fails', () => {
    expect(messageCreateSchema.safeParse({ text: 'Hi', conversationId: 'not-uuid' }).success).toBe(false);
  });
});

// ─── userUpdateSchema — disponibilites ───────────────────────────────────────
describe('userUpdateSchema — disponibilites', () => {
  const validDispo = {
    Lundi:    [false, false, false, false, false, false, false],
    Mardi:    [false, false, false, false, false, false, false],
    Mercredi: [false, false, false, false, false, false, false],
    Jeudi:    [false, false, false, false, false, false, false],
    Vendredi: [false, false, false, false, false, false, false],
    Samedi:   [false, false, false, false, false, false, false],
    Dimanche: [false, false, false, false, false, false, false],
  };

  test('valid full dispo passes', () => {
    expect(userUpdateSchema.safeParse({ disponibilites: validDispo }).success).toBe(true);
  });

  test('Lundi with only 2 booleans fails', () => {
    expect(userUpdateSchema.safeParse({ disponibilites: { ...validDispo, Lundi: [false, false] } }).success).toBe(false);
  });

  test('missing a day fails', () => {
    const { Dimanche: _, ...withoutDimanche } = validDispo;
    expect(userUpdateSchema.safeParse({ disponibilites: withoutDimanche }).success).toBe(false);
  });

  test('null disponibilites is allowed', () => {
    expect(userUpdateSchema.safeParse({ disponibilites: null }).success).toBe(true);
  });

  test('omitted disponibilites is allowed', () => {
    expect(userUpdateSchema.safeParse({}).success).toBe(true);
  });

  test('strings inside array fail', () => {
    const bad = { ...validDispo, Lundi: ['oui', 'non', 'oui', 'non', 'oui', 'non', 'oui'] };
    expect(userUpdateSchema.safeParse({ disponibilites: bad }).success).toBe(false);
  });
});

// ─── articleSchema ────────────────────────────────────────────────────────────
describe('articleSchema', () => {
  const valid = {
    titre: 'Comment réussir son BAC',
    contenu: 'Lorem ipsum dolor sit amet...',
    categorie: 'bac',
  };

  test('minimal valid article passes', () => {
    expect(articleSchema.safeParse(valid).success).toBe(true);
  });

  test('missing titre fails', () => {
    const { titre: _, ...rest } = valid;
    expect(articleSchema.safeParse(rest).success).toBe(false);
  });

  test('missing contenu fails', () => {
    const { contenu: _, ...rest } = valid;
    expect(articleSchema.safeParse(rest).success).toBe(false);
  });

  test('invalid categorie fails', () => {
    expect(articleSchema.safeParse({ ...valid, categorie: 'sport' }).success).toBe(false);
  });

  test('all valid categories pass', () => {
    for (const cat of ['conseils', 'bac', 'orientation', 'numerique', 'succes']) {
      expect(articleSchema.safeParse({ ...valid, categorie: cat }).success).toBe(true);
    }
  });

  test('publie defaults to false', () => {
    const r = articleSchema.safeParse(valid);
    expect(r.data.publie).toBe(false);
  });

  test('titre over 200 chars fails', () => {
    expect(articleSchema.safeParse({ ...valid, titre: 'T'.repeat(201) }).success).toBe(false);
  });
});

// ─── roleUpdateSchema ─────────────────────────────────────────────────────────
describe('roleUpdateSchema', () => {
  test('ELEVE passes', () => {
    expect(roleUpdateSchema.safeParse({ role: 'ELEVE' }).success).toBe(true);
  });

  test('TUTEUR passes', () => {
    expect(roleUpdateSchema.safeParse({ role: 'TUTEUR' }).success).toBe(true);
  });

  test('ADMIN passes', () => {
    expect(roleUpdateSchema.safeParse({ role: 'ADMIN' }).success).toBe(true);
  });

  test('invalid role fails', () => {
    expect(roleUpdateSchema.safeParse({ role: 'SUPERUSER' }).success).toBe(false);
  });
});
