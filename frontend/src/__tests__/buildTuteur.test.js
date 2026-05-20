import { vi, describe, test, expect } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: (_, tag) => tag }),
  AnimatePresence: ({ children }) => children,
}));

vi.spyOn(console, 'log').mockImplementation(() => {});

const { buildTuteur } = await import('../ProfilTuteurPage.jsx');

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

describe('buildTuteur', () => {
  test('conserve les champs de base', () => {
    const t = buildTuteur({ id: '1', prenom: 'Omar', nom: 'Sy', tarif: 5000 });
    expect(t.id).toBe('1');
    expect(t.prenom).toBe('Omar');
    expect(t.tarif).toBe(5000);
  });

  test('langues → [] par défaut', () => {
    expect(buildTuteur({}).langues).toEqual([]);
  });

  test('methodologie → "" par défaut', () => {
    expect(buildTuteur({}).methodologie).toBe('');
  });

  test('formations → [] par défaut', () => {
    expect(buildTuteur({}).formations).toEqual([]);
  });

  test('avis → [] par défaut', () => {
    expect(buildTuteur({}).avis).toEqual([]);
  });

  test('disponibilites → grille 7×7 de false par défaut', () => {
    const dispo = buildTuteur({}).disponibilites;
    expect(Object.keys(dispo)).toEqual(JOURS);
    JOURS.forEach(j => {
      expect(dispo[j]).toHaveLength(7);
      expect(dispo[j].every(v => v === false)).toBe(true);
    });
  });

  test('disponibilites fournies → conservées telles quelles', () => {
    const custom = { Lundi: [true, false, false, false, false, false, false] };
    const t = buildTuteur({ disponibilites: custom });
    expect(t.disponibilites).toBe(custom);
  });

  test('tauxReponse et delaiReponse → null par défaut', () => {
    const t = buildTuteur({});
    expect(t.tauxReponse).toBeNull();
    expect(t.delaiReponse).toBeNull();
  });

  test('totalEleves → 0 par défaut', () => {
    expect(buildTuteur({}).totalEleves).toBe(0);
  });
});
