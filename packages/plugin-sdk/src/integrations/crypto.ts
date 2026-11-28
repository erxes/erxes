import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

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
