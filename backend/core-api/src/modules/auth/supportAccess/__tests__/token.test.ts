/**
 * Support login tokens: only global-profile's ES256 key, for this tenant,
 * fresh and once. Every other token is null.
 */
const mockEnv: Record<string, string> = {};
const mockUsed = new Set<string>();

jest.mock('erxes-api-shared/utils', () => ({
  getEnv: ({ name }: { name: string }) => mockEnv[name] || '',
  redis: {
    set: async (key: string) => {
      if (mockUsed.has(key)) {
        return null;
      }

      mockUsed.add(key);

      return 'OK';
    },
  },
}));

import { createHmac, generateKeyPairSync, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import {
  resetSupportLoginKeys,
  verifySupportToken,
} from '@/auth/supportAccess/token';

const KID = '2026-10';
const SUBDOMAIN = 'bank';

const keys = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const attacker = generateKeyPairSync('ec', { namedCurve: 'P-256' });

const claims = (overrides: Record<string, unknown> = {}) => ({
  typ: 'support_login',
  name: 'Bat',
  email: 'bat@erxes.io',
  reason: 'Setup: pipeline',
  ...overrides,
});

const sign = (
  overrides: Record<string, unknown> = {},
  options: jwt.SignOptions = {},
  privateKey = keys.privateKey,
) =>
  jwt.sign(claims(overrides), privateKey, {
    algorithm: 'ES256',
    keyid: KID,
    issuer: 'erxes-saas',
    audience: SUBDOMAIN,
    subject: 'staff_bat',
    jwtid: randomUUID(),
    expiresIn: 60,
    ...options,
  });

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const handMade = (header: object, signature: (input: string) => string) => {
  const now = Math.floor(Date.now() / 1000);
  const input = `${base64url(header)}.${base64url({
    ...claims(),
    iss: 'erxes-saas',
    aud: SUBDOMAIN,
    sub: 'staff_bat',
    jti: randomUUID(),
    iat: now,
    exp: now + 60,
  })}`;

  return `${input}.${signature(input)}`;
};

beforeEach(() => {
  mockEnv.VERSION = 'saas';
  mockEnv.SUPPORT_LOGIN_JWKS = JSON.stringify([
    { ...keys.publicKey.export({ format: 'jwk' }), kid: KID },
  ]);
  resetSupportLoginKeys();
});

describe('a genuine token', () => {
  it('names the staff member once', async () => {
    const token = sign();

    await expect(verifySupportToken(token, SUBDOMAIN)).resolves.toEqual({
      staffId: 'staff_bat',
      name: 'Bat',
      email: 'bat@erxes.io',
      reason: 'Setup: pipeline',
    });
    await expect(verifySupportToken(token, SUBDOMAIN)).resolves.toBeNull();
  });

  it('strips markup from what reaches notification emails', async () => {
    const staff = await verifySupportToken(
      sign({ name: '<img src=x onerror=alert(1)>Bat', reason: '"Setup"' }),
      SUBDOMAIN,
    );

    expect(staff?.name).not.toMatch(/[<>"'`]/);
    expect(staff?.reason).toBe('Setup');
  });
});

describe('forged tokens', () => {
  it('rejects another key under the same kid', async () => {
    await expect(
      verifySupportToken(sign({}, {}, attacker.privateKey), SUBDOMAIN),
    ).resolves.toBeNull();
  });

  it('rejects HS256 signed with the public key as the secret', async () => {
    const publicPem = keys.publicKey
      .export({ format: 'pem', type: 'spki' })
      .toString();
    const token = handMade({ alg: 'HS256', typ: 'JWT', kid: KID }, (input) =>
      createHmac('sha256', publicPem).update(input).digest('base64url'),
    );

    await expect(verifySupportToken(token, SUBDOMAIN)).resolves.toBeNull();
  });

  it('rejects alg none', async () => {
    const token = handMade({ alg: 'none', typ: 'JWT', kid: KID }, () => '');

    await expect(verifySupportToken(token, SUBDOMAIN)).resolves.toBeNull();
  });

  it('rejects an unknown kid', async () => {
    await expect(
      verifySupportToken(sign({}, { keyid: 'old' }), SUBDOMAIN),
    ).resolves.toBeNull();
  });
});

describe('tokens meant for something else', () => {
  it.each([
    ['another tenant', {}, { audience: 'shop' }],
    ['another issuer', {}, { issuer: 'someone' }],
    ['another token type', { typ: 'magic_link_state' }, {}],
    ['an unsafe staff id', {}, { subject: '../owner' }],
    ['no reason', { reason: '' }, {}],
  ])('rejects %s', async (_label, overrides, options) => {
    await expect(
      verifySupportToken(sign(overrides, options), SUBDOMAIN),
    ).resolves.toBeNull();
  });
});

describe('stale tokens', () => {
  it('rejects a token that lives longer than a minute', async () => {
    await expect(
      verifySupportToken(sign({}, { expiresIn: 300 }), SUBDOMAIN),
    ).resolves.toBeNull();
  });

  it('rejects an expired token', async () => {
    const iat = Math.floor(Date.now() / 1000) - 120;

    await expect(
      verifySupportToken(sign({ iat }, { expiresIn: 60 }), SUBDOMAIN),
    ).resolves.toBeNull();
  });
});

describe('where support access is off', () => {
  it('lets nobody in outside erxes cloud', async () => {
    mockEnv.VERSION = 'os';

    await expect(verifySupportToken(sign(), SUBDOMAIN)).resolves.toBeNull();
  });

  it('lets nobody in without global-profile keys', async () => {
    mockEnv.SUPPORT_LOGIN_JWKS = '';
    resetSupportLoginKeys();

    await expect(verifySupportToken(sign(), SUBDOMAIN)).resolves.toBeNull();
  });
});
