const { z } = require('zod');
const validate = require('../../src/middleware/validate');

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string().min(1, 'Nom requis'),
    age: z.number().int().min(0),
  });

  let res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test('valid body → next() called, req.body replaced with parsed data', () => {
    const req = { body: { name: 'Fatou', age: 16 } };
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Fatou', age: 16 });
    expect(res.status).not.toHaveBeenCalled();
  });

  test('invalid field value → 400 with error message', () => {
    const req = { body: { name: '', age: 16 } };
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Nom requis' }));
    expect(next).not.toHaveBeenCalled();
  });

  test('missing required field → 400 with field path', () => {
    const req = { body: { age: 20 } };
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const response = res.json.mock.calls[0][0];
    expect(response.field).toBe('name');
    expect(next).not.toHaveBeenCalled();
  });

  test('unknown fields stripped (Zod strip default)', () => {
    const stripping = z.object({ name: z.string().min(1) });
    const req = { body: { name: 'Fatou', injection: 'malicious' } };
    validate(stripping)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.injection).toBeUndefined();
    expect(req.body.name).toBe('Fatou');
  });
});
