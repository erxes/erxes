import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

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

  const expected = Buffer.from(hash, 'base64url');

  const actual = await derive(
    password,
    Buffer.from(salt, 'base64url'),
    Number(n),
    Number(r),
    Number(p),
  );

  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
