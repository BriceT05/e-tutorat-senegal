import { vi, describe, test, expect } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  AnimatePresence: ({ children }) => children,
}));

// Silence le log api.js (import.meta.env absent en jsdom)
vi.spyOn(console, 'log').mockImplementation(() => {});

const { pwStrength, validate } = await import('../InscriptionPage.jsx');

// ─── pwStrength ───────────────────────────────────────────────────────────────

describe('pwStrength', () => {
  test('chaîne vide → 0', () => expect(pwStrength('')).toBe(0));
  test('< 8 chars, aucun critère → 0', () => expect(pwStrength('abc')).toBe(0));
  test('>= 8 chars seulement → 1', () => expect(pwStrength('abcdefgh')).toBe(1));
  test('>= 8 + majuscule → 2', () => expect(pwStrength('Abcdefgh')).toBe(2));
  test('>= 8 + majuscule + chiffre → 3', () => expect(pwStrength('Abcdefg1')).toBe(3));
  test('tous les critères → 4', () => expect(pwStrength('Abcdef1!')).toBe(4));
});

// ─── validate — étape 2 ───────────────────────────────────────────────────────

const BASE_INFO = { prenom: 'Awa', nom: 'Diop', email: 'awa@example.com', tel: '0600000000', password: 'Azerty12!', confirm: 'Azerty12!' };

describe('validate step 2', () => {
  test('info complète → aucune erreur', () => {
    expect(validate(2, 'eleve', BASE_INFO, {})).toEqual({});
  });

  test('prénom manquant → erreur prenom', () => {
    const errs = validate(2, 'eleve', { ...BASE_INFO, prenom: '  ' }, {});
    expect(errs.prenom).toBeTruthy();
  });

  test('email invalide → erreur email', () => {
    const errs = validate(2, 'eleve', { ...BASE_INFO, email: 'pas-un-email' }, {});
    expect(errs.email).toBeTruthy();
  });

  test('mot de passe trop court → erreur password', () => {
    const errs = validate(2, 'eleve', { ...BASE_INFO, password: 'court', confirm: 'court' }, {});
    expect(errs.password).toBeTruthy();
  });

  test('confirm différent → erreur confirm', () => {
    const errs = validate(2, 'eleve', { ...BASE_INFO, confirm: 'autre' }, {});
    expect(errs.confirm).toBeTruthy();
  });

  test('téléphone manquant → erreur tel', () => {
    const errs = validate(2, 'eleve', { ...BASE_INFO, tel: '' }, {});
    expect(errs.tel).toBeTruthy();
  });
});

// ─── validate — étape 3 élève ─────────────────────────────────────────────────

const BASE_ELEVE = { niveau: 'Terminale', region: 'Dakar', matieres: ['Maths'] };

describe('validate step 3 eleve', () => {
  test('profil complet → aucune erreur', () => {
    expect(validate(3, 'eleve', BASE_INFO, BASE_ELEVE)).toEqual({});
  });

  test('niveau manquant → erreur niveau', () => {
    const errs = validate(3, 'eleve', BASE_INFO, { ...BASE_ELEVE, niveau: '' });
    expect(errs.niveau).toBeTruthy();
  });

  test('région manquante → erreur region', () => {
    const errs = validate(3, 'eleve', BASE_INFO, { ...BASE_ELEVE, region: '' });
    expect(errs.region).toBeTruthy();
  });

  test('aucune matière → erreur matieres', () => {
    const errs = validate(3, 'eleve', BASE_INFO, { ...BASE_ELEVE, matieres: [] });
    expect(errs.matieres).toBeTruthy();
  });
});

// ─── validate — étape 3 tuteur ────────────────────────────────────────────────

const BASE_TUTEUR = { diplome: 'Licence', region: 'Dakar', matieres: ['Physique'], niveaux: ['Terminale'] };

describe('validate step 3 tuteur', () => {
  test('profil complet → aucune erreur', () => {
    expect(validate(3, 'tuteur', BASE_INFO, BASE_TUTEUR)).toEqual({});
  });

  test('diplôme manquant → erreur diplome', () => {
    const errs = validate(3, 'tuteur', BASE_INFO, { ...BASE_TUTEUR, diplome: '' });
    expect(errs.diplome).toBeTruthy();
  });

  test('aucune matière → erreur matieres', () => {
    const errs = validate(3, 'tuteur', BASE_INFO, { ...BASE_TUTEUR, matieres: [] });
    expect(errs.matieres).toBeTruthy();
  });

  test('aucun niveau → erreur niveaux', () => {
    const errs = validate(3, 'tuteur', BASE_INFO, { ...BASE_TUTEUR, niveaux: [] });
    expect(errs.niveaux).toBeTruthy();
  });
});
