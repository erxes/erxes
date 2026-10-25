import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Service-to-service signatures over a base64url JSON payload, keyed by the
 * `JWT_TOKEN_SECRET` every backend service shares. A token is
 * `<payload base64url>.<signature base64url>`.
 *
 * `purpose` separates token families: the HMAC covers `<purpose>.<payload>`,
 * so a token minted for one purpose never verifies for another. Leaving it
 * out signs the bare payload, which is the agent-tools header format.
 *
 * There is intentionally NO default secret: a hardcoded fallback would let
 * anyone reproduce the HMAC, so signing throws and verifying fails closed
 * until `JWT_TOKEN_SECRET` is configured.
 */

const getServiceSecret = (): string => {
  const secret = process.env.JWT_TOKEN_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_TOKEN_SECRET is required to sign and verify service-to-service ' +
        'requests. Set JWT_TOKEN_SECRET to the same value across all ' +
        'backend services.',
    );
  }

  return secret;
};

/** HMAC-SHA256 of the payload (prefixed by its purpose), base64url. */
export const signServicePayload = (
  payloadBase64: string,
  purpose?: string,
): string =>
  createHmac('sha256', getServiceSecret())
    .update(purpose ? `${purpose}.${payloadBase64}` : payloadBase64)
    .digest('base64url');

/**
 * Splits and verifies a `<payload>.<signature>` token. Returns the decoded
 * JSON payload, or null when the token is missing, malformed, signed for
 * another purpose, or the secret is not configured.
 */
export const verifyServiceToken = (
  token: unknown,
  purpose?: string,
): Record<string, unknown> | null => {
  if (typeof token !== 'string') {
    return null;
  }

  const separatorIndex = token.lastIndexOf('.');

  if (separatorIndex === -1) {
    return null;
  }

  const payloadBase64 = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  let expectedSignature: string;

  try {
    expectedSignature = signServicePayload(payloadBase64, purpose);
  } catch {
    return null;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    );

    return payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

/** Signs a JSON payload, stamping its issue time as `at`. */
export const createServiceToken = (
  payload: Record<string, unknown>,
  purpose: string,
): string => {
  const payloadBase64 = Buffer.from(
    JSON.stringify({ ...payload, at: Date.now() }),
    'utf8',
  ).toString('base64url');

  return `${payloadBase64}.${signServicePayload(payloadBase64, purpose)}`;
};

/**
 * Verifies a token from `createServiceToken` and its freshness. Returns the
 * payload, or null when it is invalid or older than `ttlMs`.
 */
export const readServiceToken = (
  token: unknown,
  purpose: string,
  ttlMs: number,
): Record<string, unknown> | null => {
  const payload = verifyServiceToken(token, purpose);

  if (
    !payload ||
    typeof payload.at !== 'number' ||
    Math.abs(Date.now() - payload.at) > ttlMs
  ) {
    return null;
  }

  return payload;
};
