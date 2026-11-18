import { generateKeyPairSync } from 'crypto';

jest.mock('erxes-api-shared/utils', () => ({
  getEnv: ({ name, defaultValue }: { name: string; defaultValue?: string }) =>
    process.env[name] || defaultValue || '',
}));

import {
  getJwks,
  getSigningKey,
  resetSigningKey,
} from '@/auth/routes/oauth/productTokens';

const env = { ...process.env };

const pem = () =>
  generateKeyPairSync('rsa', { modulusLength: 2048 })
    .privateKey.export({ type: 'pkcs8', format: 'pem' })
    .toString();

afterEach(() => {
  process.env = { ...env };
  resetSigningKey();
});

describe('product token signing key', () => {
  it('refuses to sign in production without a configured key', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.OAUTH_SIGNING_KEY;
    delete process.env.OAUTH_SIGNING_KEY_FILE;

    expect(() => getSigningKey()).toThrow('OAUTH_SIGNING_KEY');
  });

  it('uses the configured key, also written on one line with \\n', () => {
    const key = pem();

    process.env.NODE_ENV = 'production';
    process.env.OAUTH_SIGNING_KEY = key.replace(/\n/g, '\\n');

    const jwks = getJwks();

    expect(getSigningKey().privateKeyPem).toBe(key);
    expect(jwks.keys).toHaveLength(1);
    expect(jwks.keys[0]).toMatchObject({
      kty: 'RSA',
      alg: 'RS256',
      use: 'sig',
    });
    expect(jwks.keys[0]).not.toHaveProperty('d');
  });

  it('keeps the same key id for the same key', () => {
    process.env.OAUTH_SIGNING_KEY = pem();

    const first = getJwks().keys[0].kid;

    resetSigningKey();

    expect(getJwks().keys[0].kid).toBe(first);
  });
});
