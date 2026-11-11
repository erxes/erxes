import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** RFC 6238 time-based codes (what Google Authenticator, 1Password, Authy show): SHA-1, 30 s, 6 digits. */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const base32Encode = (buffer: Buffer) => {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];

  return output;
};

export const base32Decode = (text: string) => {
  const clean = text.replace(/=+$/, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = ALPHABET.indexOf(char);

    if (index < 0) throw new Error('not base32');

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
};

export const newTotpSecret = () => base32Encode(randomBytes(20));

export const STEP_SECONDS = 30;

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP_SECONDS);

export const codeAt = (secret: string, step: number) => {
  const counter = Buffer.alloc(8);

  counter.writeBigUInt64BE(BigInt(step));

  const digest = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = digest[digest.length - 1]! & 15;
  const binary = digest.readUInt32BE(offset) & 0x7fffffff;

  return String(binary % 1_000_000).padStart(6, '0');
};

/**
 * The step a code belongs to (this one, or one either side for clock drift),
 * or null. Callers refuse steps at or before the last one used: a code works once.
 */
export const matchStep = (secret: string, code: string, now = Date.now()) => {
  const step = currentStep(now);

  for (const candidate of [step, step - 1, step + 1]) {
    const expected = Buffer.from(codeAt(secret, candidate));
    const given = Buffer.from(code.padStart(6, '0').slice(0, 6));

    if (timingSafeEqual(expected, given)) return candidate;
  }

  return null;
};

export const otpauthUri = (secret: string, account: string, issuer = 'erxes') =>
  `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${STEP_SECONDS}`;
