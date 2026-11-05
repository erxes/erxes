/**
 * secretBox — AES-256-GCM sealing for BYOK keys at rest.
 *
 * The guarantees under test:
 *
 * - a sealed value round-trips back to the plaintext;
 * - sealing is non-deterministic — the same plaintext never produces the
 *   same envelope twice (random IV);
 * - a tampered envelope, a wrong secret (rotated JWT key), and a missing
 *   secret all open to null — never throw, never leak;
 * - legacy plaintext (no `enc:v1:` prefix) passes through so readers can
 *   lazily re-seal it;
 * - `sealSecret` fails closed when JWT_TOKEN_SECRET is unset.
 */

import { isSealedSecret, openSecret, sealSecret } from '@/agents/secretBox';

process.env.JWT_TOKEN_SECRET ??= 'secretbox-test-secret';

const ORIGINAL_SECRET = process.env.JWT_TOKEN_SECRET;

const reloadModule = async () => {
  jest.resetModules();
  return import('../secretBox.js');
};

afterEach(() => {
  process.env.JWT_TOKEN_SECRET = ORIGINAL_SECRET;
});

describe('sealSecret / openSecret', () => {
  it('round-trips a plaintext key through a sealed envelope', () => {
    const sealed = sealSecret('sk-live-abc123');

    expect(sealed).toMatch(/^enc:v1:/);
    expect(sealed).not.toContain('sk-live-abc123');
    expect(openSecret(sealed)).toBe('sk-live-abc123');
  });

  it('produces distinct envelopes for the same plaintext', () => {
    const a = sealSecret('sk-same');
    const b = sealSecret('sk-same');

    expect(a).not.toBe(b);
    expect(openSecret(a)).toBe('sk-same');
    expect(openSecret(b)).toBe('sk-same');
  });

  it('returns null for a tampered ciphertext or tag', () => {
    const sealed = sealSecret('sk-tamper');
    const [, iv, tag, data] = sealed.split(':');
    const badTag = `enc:v1:${iv}:${Buffer.from('deadbeefdeadbeefdeadbeefdeadbeef', 'hex').toString('base64url')}:${data}`;
    const badData = `enc:v1:${iv}:${tag}:AAAA`;

    expect(openSecret(badTag)).toBeNull();
    expect(openSecret(badData)).toBeNull();
    expect(openSecret('enc:v1:not-enough-parts')).toBeNull();
  });

  it('returns null when the stored value was sealed under another secret', async () => {
    const sealed = sealSecret('sk-under-old-secret');

    process.env.JWT_TOKEN_SECRET = `${ORIGINAL_SECRET}-rotated`;
    const fresh = await reloadModule();

    expect(fresh.openSecret(sealed)).toBeNull();
  });

  it('passes legacy plaintext through unchanged', () => {
    expect(openSecret('sk-plain-legacy')).toBe('sk-plain-legacy');
    expect(isSealedSecret('sk-plain-legacy')).toBe(false);
  });

  it('returns null for missing and non-string values', () => {
    expect(openSecret(undefined)).toBeNull();
    expect(openSecret(null)).toBeNull();
    expect(openSecret('')).toBeNull();
    expect(openSecret(42)).toBeNull();
  });

  it('fails closed when JWT_TOKEN_SECRET is unset', async () => {
    delete process.env.JWT_TOKEN_SECRET;
    const fresh = await reloadModule();

    expect(() => fresh.sealSecret('sk-no-secret')).toThrow(
      'Agents key encryption is not configured.',
    );
    expect(fresh.openSecret(undefined)).toBeNull();
    // A sealed value from before also cannot open without the secret.
    expect(fresh.openSecret('enc:v1:AAAAAAAAAAAQ:AAAA:AAAA')).toBeNull();
    // Plaintext still passes through — reads must not break when the
    // deployment secret was never configured for this process.
    expect(fresh.openSecret('sk-plain')).toBe('sk-plain');
  });
});
