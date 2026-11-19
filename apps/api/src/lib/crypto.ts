import { compare as compareBcrypt } from 'bcryptjs';
import {
  argon2,
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  scrypt,
  type ScryptOptions,
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
  verify,
} from 'node:crypto';

type TextEncoding = 'hex' | 'base64url';

const bytes = (value: string | Buffer) => (typeof value === 'string' ? Buffer.from(value) : value);

/** Constant-time equality; values of different lengths are unequal. */
export const safeEqual = (a: string | Buffer, b: string | Buffer) => {
  const left = bytes(a);
  const right = bytes(b);

  return left.length === right.length && timingSafeEqual(left, right);
};

export const sha256 = (value: string | Buffer, encoding: TextEncoding = 'hex') =>
  createHash('sha256').update(value).digest(encoding);

export const hmacSha256 = (key: string | Buffer, value: string, encoding: TextEncoding) =>
  createHmac('sha256', key).update(value).digest(encoding);

/** HMAC-SHA256 as bytes, to chain into the next key (AWS signing keys). */
export const hmacSha256Bytes = (key: string | Buffer, value: string) =>
  createHmac('sha256', key).update(value).digest();

/** A 32-byte key derived from `secret` (HKDF-SHA256, no salt), one per `info`. */
export const deriveKey = (secret: string, info: string) =>
  Buffer.from(hkdfSync('sha256', secret, Buffer.alloc(0), info, 32));

/** `size` random bytes as text: secrets, link tokens, unique names. */
export const randomToken = (size: number, encoding: TextEncoding = 'base64url') =>
  randomBytes(size).toString(encoding);

/** A signing secret core shows once, for webhooks and audit streams. */
export const newSigningSecret = () => `whsec_${randomToken(24)}`;

// ─── Passwords ──────────────────────────────────────────────────────────────

type Argon2Cost = { memory: number; passes: number; parallelism: number };

// OWASP's argon2id settings: 19 MiB, 2 passes, 1 lane, a 16-byte salt and a 32-byte tag.
const ARGON2: Argon2Cost = { memory: 19456, passes: 2, parallelism: 1 };
const SALT_LENGTH = 16;
const TAG_LENGTH = 32;

/** What every hash made with today's settings starts with (the PHC string format). */
const CURRENT = `$argon2id$v=19$m=${ARGON2.memory},t=${ARGON2.passes},p=${ARGON2.parallelism}$`;

const PHC = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

const argon2id = (password: string, nonce: Buffer, cost: Argon2Cost, tagLength: number) =>
  new Promise<Buffer>((resolve, reject) => {
    argon2('argon2id', { message: password, nonce, tagLength, ...cost }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });

/** PHC strings carry base64 without padding. */
const phcBase64 = (value: Buffer) => value.toString('base64').replace(/=+$/, '');

/** `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`; the cost is stored so it can change later. */
export const hashPassword = async (password: string) => {
  const salt = randomBytes(SALT_LENGTH);
  const key = await argon2id(password, salt, ARGON2, TAG_LENGTH);

  return `${CURRENT}${phcBase64(salt)}$${phcBase64(key)}`;
};

/** False for a hash sign-in should replace: an older format or older argon2id settings. */
export const isCurrentPasswordHash = (stored: string) => stored.startsWith(CURRENT);

const scryptKey = (password: string, salt: Buffer, cost: ScryptOptions, keyLength: number) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, keyLength, { ...cost, maxmem: 64 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });

/**
 * Checks a password against any format core has stored: argon2id, core's
 * earlier `scrypt$N$r$p$salt$hash` (base64url), and old erxes' bcrypt of the
 * password's hex SHA-256 (`$2a$`/`$2b$`), which imported members keep.
 */
export const verifyPassword = async (password: string, stored: string | null) => {
  const value = stored ?? '';
  const phc = PHC.exec(value);

  if (phc) {
    const [, m, t, p, salt = '', hash = ''] = phc;
    const expected = Buffer.from(hash, 'base64');
    const cost = { memory: Number(m), passes: Number(t), parallelism: Number(p) };
    const actual = await argon2id(password, Buffer.from(salt, 'base64'), cost, expected.length);

    return safeEqual(actual, expected);
  }

  const parts = value.split('$');
  const [scheme, n, r, p, salt, hash] = parts;

  if (parts.length === 6 && scheme === 'scrypt' && salt && hash) {
    const expected = Buffer.from(hash, 'base64url');
    const cost = { N: Number(n), r: Number(r), p: Number(p) };
    const actual = await scryptKey(password, Buffer.from(salt, 'base64url'), cost, expected.length);

    return safeEqual(actual, expected);
  }

  if (/^\$2[ab]\$\d\d\$/.test(value)) return compareBcrypt(sha256(password), value);

  // Same work as a real check, so timing does not reveal unknown accounts.
  await argon2id(password, randomBytes(SALT_LENGTH), ARGON2, TAG_LENGTH);

  return false;
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
