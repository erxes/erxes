import { createHmac, timingSafeEqual } from 'node:crypto';

export const trpcAuthHeaderName = 'x-erxes-trpc-auth';

const AUTH_TTL_MS = 5 * 60 * 1000;
const DEFAULT_SECRET = 'SECRET';

/**
 * Every backend service shares JWT_TOKEN_SECRET, so a request signed by one
 * service verifies in another. Production refuses the development default.
 */
export const getTRPCAuthSecret = (): string => {
  const secret = process.env.JWT_TOKEN_SECRET?.trim() || DEFAULT_SECRET;

  if (process.env.NODE_ENV === 'production' && secret === DEFAULT_SECRET) {
    throw new Error(
      'JWT_TOKEN_SECRET must be set in production to authenticate service-to-service tRPC requests',
    );
  }

  return secret;
};

const computeSignature = (
  issuedAt: string,
  procedurePath: string,
  contextHeader: string,
): string =>
  createHmac('sha256', getTRPCAuthSecret())
    .update(`${issuedAt}\n${procedurePath}\n${contextHeader}`)
    .digest('base64url');

/**
 * Sign an encoded tRPC context header for one procedure so the receiving
 * service can trust the tenant and caller identity it carries, and so a leaked
 * credential cannot be replayed against any other procedure.
 */
export const signTRPCContext = (
  contextHeader: string,
  procedurePath: string,
): string => {
  const issuedAt = String(Date.now());

  return `${issuedAt}.${computeSignature(
    issuedAt,
    procedurePath,
    contextHeader,
  )}`;
};

/**
 * Returns false for missing, malformed, expired, or mismatched credentials,
 * and when the signing secret is not configured.
 */
export const verifyTRPCContext = (
  contextHeader: unknown,
  authHeader: unknown,
  procedurePath: string,
): boolean => {
  if (typeof contextHeader !== 'string' || typeof authHeader !== 'string') {
    return false;
  }

  const separatorIndex = authHeader.indexOf('.');

  if (separatorIndex === -1) {
    return false;
  }

  const issuedAt = authHeader.slice(0, separatorIndex);
  const signature = authHeader.slice(separatorIndex + 1);

  const age = Math.abs(Date.now() - Number(issuedAt));

  if (!(age <= AUTH_TTL_MS)) {
    return false;
  }

  let expectedSignature: string;

  try {
    expectedSignature = computeSignature(
      issuedAt,
      procedurePath,
      contextHeader,
    );
  } catch {
    return false;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  return (
    signatureBuffer.length === expectedBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedBuffer)
  );
};
