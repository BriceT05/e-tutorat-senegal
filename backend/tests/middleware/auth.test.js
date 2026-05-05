const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/auth');

describe('auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test('missing Authorization header → 401 Token manquant', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token manquant' });
    expect(next).not.toHaveBeenCalled();
  });

  test('non-Bearer scheme → 401', () => {
    req.headers.authorization = 'Basic dXNlcjpwYXNz';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('malformed token → 401 Token invalide ou expiré', () => {
    req.headers.authorization = 'Bearer not.a.valid.jwt';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token invalide ou expiré' });
    expect(next).not.toHaveBeenCalled();
  });

  test('expired token → 401', () => {
    const token = jwt.sign({ id: 'u1', role: 'ELEVE' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('valid token → sets req.user and calls next()', () => {
    const token = jwt.sign({ id: 'user-123', role: 'TUTEUR' }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe('user-123');
    expect(req.user.role).toBe('TUTEUR');
    expect(res.status).not.toHaveBeenCalled();
  });
});
