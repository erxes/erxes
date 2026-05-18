import { safeEq } from './sanitizeMongoQuery';

describe('safeEq', () => {
  it('wraps primitive strings as { $eq: value }', () => {
    expect(safeEq('user-123')).toEqual({ $eq: 'user-123' });
  });

  it('wraps numbers and booleans', () => {
    expect(safeEq(42)).toEqual({ $eq: 42 });
    expect(safeEq(true)).toEqual({ $eq: true });
  });

  it('neutralises operator-shaped payloads (NoSQL injection class)', () => {
    const malicious = { $ne: null } as unknown as string;
    const wrapped = safeEq(malicious);
    expect(wrapped).toEqual({ $eq: { $ne: null } });
    expect(Object.keys(wrapped)).toEqual(['$eq']);
  });
});
