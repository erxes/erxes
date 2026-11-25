import { getJwtTokenSecret } from '../jwt-secret';

describe('getJwtTokenSecret', () => {
  const original = {
    secret: process.env.JWT_TOKEN_SECRET,
    env: process.env.NODE_ENV,
  };

  const set = (name: 'JWT_TOKEN_SECRET' | 'NODE_ENV', value?: string) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  };

  afterEach(() => {
    set('JWT_TOKEN_SECRET', original.secret);
    set('NODE_ENV', original.env);
  });

  it('returns the configured secret', () => {
    set('JWT_TOKEN_SECRET', 'configured');
    set('NODE_ENV', 'production');
    expect(getJwtTokenSecret()).toBe('configured');
  });

  it('falls back to the development key outside production', () => {
    set('JWT_TOKEN_SECRET');
    set('NODE_ENV', 'development');
    expect(getJwtTokenSecret()).toBe('SECRET');
  });

  it('refuses the fallback in production', () => {
    set('JWT_TOKEN_SECRET');
    set('NODE_ENV', 'production');
    expect(() => getJwtTokenSecret()).toThrow('JWT_TOKEN_SECRET must be set');
  });

  it('refuses the literal fallback value in production', () => {
    set('JWT_TOKEN_SECRET', 'SECRET');
    set('NODE_ENV', 'production');
    expect(() => getJwtTokenSecret()).toThrow('JWT_TOKEN_SECRET must be set');
  });
});
