import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

// RFC 6238 defaults every authenticator app understands
const STEP_SECS = 30;
const DIGITS = 6;
// One step either side covers phone clock drift
const DRIFT_STEPS = 1;
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const RECOVERY_CODE_COUNT = 10;

export const toBase32 = (buffer: Buffer) => {
  let bits = '';

  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0');
  }

  return (bits.match(/.{1,5}/g) || [])
    .map((chunk) => BASE32[parseInt(chunk.padEnd(5, '0'), 2)])
    .join('');
};

export const fromBase32 = (text: string) => {
  const bits = text
    .replace(/=+$/, '')
    .toUpperCase()
    .split('')
    .map((char) => {
      const index = BASE32.indexOf(char);

      if (index < 0) {
        throw new Error('Invalid base32 secret');
      }

      return index.toString(2).padStart(5, '0');
    })
    .join('');

  return Buffer.from(
    (bits.match(/.{8}/g) || []).map((byte) => parseInt(byte, 2)),
  );
};

export const hotp = (key: Buffer, counter: number, digits = DIGITS) => {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));

  const hash = createHmac('sha1', key).update(message).digest();
  const offset = hash[hash.length - 1] & 0xf;
  const code = (hash.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits;

  return code.toString().padStart(digits, '0');
};

const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECS);

export const newTotpSecret = () => toBase32(randomBytes(20));

export const otpauthUrl = (secret: string, account: string, issuer: string) =>
  `otpauth://totp/${encodeURIComponent(
    `${issuer}:${account}`,
  )}?secret=${secret}&issuer=${encodeURIComponent(
    issuer,
  )}&digits=${DIGITS}&period=${STEP_SECS}`;

const sameCode = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * The time step the code belongs to, or null. Steps at or before lastUsedStep
 * are refused, so each code signs in once.
 */
export const verifyTotp = (
  secret: string,
  code: string,
  lastUsedStep = -1,
  now = Date.now(),
) => {
  const normalized = code.replace(/\s/g, '');

  if (!/^\d{6}$/.test(normalized)) {
    return null;
  }

  const key = fromBase32(secret);
  const step = currentStep(now);

  for (
    let candidate = step - DRIFT_STEPS;
    candidate <= step + DRIFT_STEPS;
    candidate++
  ) {
    if (
      candidate > lastUsedStep &&
      sameCode(hotp(key, candidate), normalized)
    ) {
      return candidate;
    }
  }

  return null;
};

export const normalizeRecoveryCode = (code: string) =>
  code.toLowerCase().replace(/[^a-z2-7]/g, '');

export const hashRecoveryCode = (code: string) =>
  createHash('sha256').update(normalizeRecoveryCode(code)).digest('hex');

/** Ten one-time codes like "k7m2-xq4p", shown once and stored hashed. */
export const newRecoveryCodes = () =>
  Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const code = toBase32(randomBytes(5)).toLowerCase();

    return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
  });
