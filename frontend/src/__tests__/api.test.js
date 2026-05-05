import { vi, describe, test, expect, beforeEach } from 'vitest';

// Stub fetch avant l'import du module
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Silence les logs module-level de api.js
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

const { default: api } = await import('../api.js');

describe('api.js — gestion des erreurs réseau et HTTP', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  test('erreur réseau (fetch throw) → { error: "Impossible de contacter..." }', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await api.get('/health');
    expect(result.error).toContain('Impossible de contacter');
  });

  test('réponse 405 → { error: "...405..." } sans appeler res.json()', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 405 });
    const result = await api.post('/auth/login', {});
    expect(result.error).toContain('405');
  });

  test('réponse non-JSON (ex: HTML 503) → { error: "Erreur serveur (503)..." }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValueOnce(new SyntaxError('Unexpected token')),
    });
    const result = await api.get('/tuteurs');
    expect(result.error).toContain('503');
  });

  test('réponse 200 JSON → retourne le body parsé', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({ ok: true, data: 'pong' }),
    });
    const result = await api.get('/health');
    expect(result.ok).toBe(true);
    expect(result.data).toBe('pong');
  });

  test('token en localStorage → header Authorization: Bearer <token>', async () => {
    localStorage.setItem('etutorat_token', 'mon-jwt');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({}),
    });
    await api.get('/auth/me');
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer mon-jwt');
  });

  test('pas de token → pas de header Authorization', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce([]),
    });
    await api.get('/tuteurs');
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });
});
