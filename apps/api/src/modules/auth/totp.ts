import { Secret, TOTP } from 'otpauth';

/**
 * RFC 6238 codes as authenticator apps show them (SHA-1, 30 s, 6 digits). Secrets are stored
 * as unpadded base32 of 20 random bytes.
 */
const PERIOD = 30;

const totpOf = (secret: string) =>
  new TOTP({ secret: Secret.fromBase32(secret), algorithm: 'SHA1', digits: 6, period: PERIOD });

export const newTotpSecret = () => new Secret({ size: 20 }).base32;

export const currentStep = (now = Date.now()) => TOTP.counter({ period: PERIOD, timestamp: now });

export const codeAt = (secret: string, step: number) =>
  totpOf(secret).generate({ timestamp: step * PERIOD * 1000 });

/**
 * The step a code belongs to (this one, or one either side for clock drift),
 * or null. Callers refuse steps at or before the last one used: a code works once.
 */
export const matchStep = (secret: string, code: string, now = Date.now()) => {
  const delta = totpOf(secret).validate({ token: code, timestamp: now, window: 1 });

  return delta === null ? null : currentStep(now) + delta;
};

/** The label and issuer authenticator apps show; the label carries the issuer prefix too. */
export const otpauthUri = (secret: string, account: string, issuer = 'erxes') =>
  `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${PERIOD}`;
