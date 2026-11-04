import {
  fromBase32,
  hashRecoveryCode,
  hotp,
  newRecoveryCodes,
  newTotpSecret,
  toBase32,
  verifyTotp,
} from '@/auth/twoFactor/totp';

// RFC 6238 appendix B, SHA-1, 8 digits
const RFC_KEY = Buffer.from('12345678901234567890');
const RFC_VECTORS: [number, string][] = [
  [59, '94287082'],
  [1111111109, '07081804'],
  [1111111111, '14050471'],
  [1234567890, '89005924'],
  [2000000000, '69279037'],
];

const codeAt = (secret: string, unixSecs: number) =>
  hotp(fromBase32(secret), Math.floor(unixSecs / 30));

describe('TOTP', () => {
  it.each(RFC_VECTORS)('matches the RFC 6238 vector at %i', (time, code) => {
    expect(hotp(RFC_KEY, Math.floor(time / 30), 8)).toBe(code);
  });

  it('round-trips base32 secrets', () => {
    const secret = newTotpSecret();

    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(toBase32(fromBase32(secret))).toBe(secret);
  });

  it('accepts one step of clock drift either way, not two', () => {
    const secret = newTotpSecret();
    const now = 1_800_000_000_000;
    const at = (offsetSecs: number) => codeAt(secret, now / 1000 + offsetSecs);

    expect(verifyTotp(secret, at(-30), -1, now)).not.toBeNull();
    expect(verifyTotp(secret, at(30), -1, now)).not.toBeNull();
    expect(verifyTotp(secret, at(-60), -1, now)).toBeNull();
    expect(verifyTotp(secret, at(60), -1, now)).toBeNull();
  });

  it('refuses a step that was already used', () => {
    const secret = newTotpSecret();
    const now = 1_800_000_000_000;
    const code = codeAt(secret, now / 1000);
    const step = verifyTotp(secret, code, -1, now);

    expect(step).not.toBeNull();
    expect(verifyTotp(secret, code, step ?? 0, now)).toBeNull();
  });

  it('refuses anything that is not six digits', () => {
    const secret = newTotpSecret();

    expect(verifyTotp(secret, '12345')).toBeNull();
    expect(verifyTotp(secret, 'abcdef')).toBeNull();
    expect(verifyTotp(secret, '')).toBeNull();
  });
});

describe('recovery codes', () => {
  it('issues ten distinct codes that hash the same however they are typed', () => {
    const codes = newRecoveryCodes();

    expect(new Set(codes).size).toBe(10);
    expect(codes[0]).toMatch(/^[a-z2-7]{4}-[a-z2-7]{4}$/);
    expect(hashRecoveryCode(codes[0].toUpperCase().replace('-', ' '))).toBe(
      hashRecoveryCode(codes[0]),
    );
  });
});
