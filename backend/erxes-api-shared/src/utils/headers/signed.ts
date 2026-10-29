import { createHmac, timingSafeEqual } from 'node:crypto';

export const IDENTITY_HEADER_TTL_MS = 5 * 60 * 1000;

const KEY_LABEL = 'erxes-internal-identity';

export interface IVerifiedIdentityHeader<T = unknown> {
  subdomain: string;
  value: T;
}

export const assertIdentitySecret = (): string => {
  const secret = process.env.JWT_TOKEN_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_TOKEN_SECRET is required to sign and verify internal identity ' +
        'headers. Set it to the same value on the gateway and every backend ' +
        'service.',
    );
  }

  return secret;
};

const sign = (name: string, payloadBase64: string): string => {
  const key = createHmac('sha256', assertIdentitySecret())
    .update(KEY_LABEL)
    .digest();

  return createHmac('sha256', key)
    .update(`${name}.${payloadBase64}`)
    .digest('base64url');
};

export const signIdentityHeader = (
  name: string,
  subdomain: string,
  value: unknown,
): string => {
  const payloadBase64 = Buffer.from(
    JSON.stringify({ subdomain, at: Date.now(), value }),
    'utf8',
  ).toString('base64url');

  return `${payloadBase64}.${sign(name, payloadBase64)}`;
};

export const verifyIdentityHeader = <T = unknown>(
  name: string,
  header: string,
): IVerifiedIdentityHeader<T> | null => {
  const separatorIndex = header.lastIndexOf('.');

  if (separatorIndex === -1) {
    return null;
  }

  const payloadBase64 = header.slice(0, separatorIndex);
  const signature = Buffer.from(header.slice(separatorIndex + 1));

  let expected: Buffer;

  try {
    expected = Buffer.from(sign(name, payloadBase64));
  } catch {
    return null;
  }

  if (
    signature.length !== expected.length ||
    !timingSafeEqual(signature, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    );

    if (
      typeof payload?.subdomain !== 'string' ||
      !payload.subdomain ||
      typeof payload.at !== 'number' ||
      Math.abs(Date.now() - payload.at) > IDENTITY_HEADER_TTL_MS
    ) {
      return null;
    }

    return { subdomain: payload.subdomain, value: payload.value };
  } catch {
    return null;
  }
};
