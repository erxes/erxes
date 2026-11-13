import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'node:crypto';

/**
 * Everything core does with `node:crypto`. Stored hashes, signatures and
 * tokens keep their format only if every place makes them the same way, so
 * `no-restricted-imports` keeps `node:crypto` out of every other file.
 */

export {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject,
  randomInt,
  randomUUID,
} from 'node:crypto';

type TextEncoding = 'hex' | 'base64url';

const bytes = (value: string | Buffer) => (typeof value === 'string' ? Buffer.from(value) : value);

/** Constant-time equality; values of different lengths are unequal. */
export const safeEqual = (a: string | Buffer, b: string | Buffer) => {
  const left = bytes(a);
  const right = bytes(b);

  return left.length === right.length && timingSafeEqual(left, right);
};

export const sha256 = (value: string, encoding: TextEncoding = 'hex') =>
  createHash('sha256').update(value).digest(encoding);

export const hmacSha256 = (key: string | Buffer, value: string, encoding: TextEncoding) =>
  createHmac('sha256', key).update(value).digest(encoding);

/** A 32-byte key derived from `secret` (HKDF-SHA256, no salt), one per `info`. */
export const deriveKey = (secret: string, info: string) =>
  Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), info, 32));

/** `size` random bytes as text: secrets, link tokens, unique names. */
export const randomToken = (size: number, encoding: TextEncoding = 'base64url') =>
  randomBytes(size).toString(encoding);

/** A signing secret core shows once, for webhooks and audit streams. */
export const newSigningSecret = () => `whsec_${randomToken(24)}`;

// ─── Passwords ──────────────────────────────────────────────────────────────

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

const derive = (password: string, salt: Buffer, n: number, r: number, p: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });

/** `scrypt$N$r$p$salt$hash` (base64url); parameters are stored so they can change later. */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);

  return ['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join('$');
};

export const verifyPassword = async (password: string, stored: string | null): Promise<boolean> => {
  const parts = (stored ?? '').split('$');
  const [scheme, n, r, p, salt, hash] = parts;

  if (parts.length !== 6 || scheme !== 'scrypt' || salt === undefined || hash === undefined) {
    // Same work as a real check, so timing does not reveal unknown accounts.
    await derive(password, randomBytes(16), N, R, P);

    return false;
  }

  const actual = await derive(
    password,
    Buffer.from(salt, 'base64url'),
    Number(n),
    Number(r),
    Number(p),
  );

  return safeEqual(actual, Buffer.from(hash, 'base64url'));
};

// ─── Sealed secrets ─────────────────────────────────────────────────────────

/** AES-256-GCM, as `v1.<iv>.<tag>.<ciphertext>` (base64url). */
export const encrypt = (key: Buffer, plain: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);

  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    data.toString('base64url'),
  ].join('.');
};

export const decrypt = (key: Buffer, sealed: string) => {
  const [version, iv, tag, data] = sealed.split('.');

  if (version !== 'v1' || !iv || !tag || !data) throw new Error('not a sealed secret');

  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));

  decipher.setAuthTag(Buffer.from(tag, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(data, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
};
