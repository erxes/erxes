import { createHmac, timingSafeEqual } from 'node:crypto';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';
import { identitySignatureHeaderName, SIGNED_IDENTITY_HEADERS } from './names';

/**
 * Internal header signatures.
 *
 * The gateway signs the identity headers it mints, and services sign the tRPC
 * context header, with an HMAC keyed from JWT_TOKEN_SECRET (already shared by
 * every backend service). Receivers verify before trusting those headers.
 *
 * Services deploy independently, so enforcement is opt-in:
 * - `INTERNAL_HEADER_SIGNATURE=report` (default): unsigned or invalid headers
 *   are still accepted, with a rate-limited warning. A mixed-version
 *   deployment keeps working.
 * - `INTERNAL_HEADER_SIGNATURE=enforce`: unsigned or invalid headers are
 *   ignored (identity) or rejected (tRPC). Without JWT_TOKEN_SECRET nothing
 *   can be verified, so every internal identity header is rejected.
 */
export const internalHeaderSignatureEnvName = 'INTERNAL_HEADER_SIGNATURE';

export type InternalHeaderSignatureMode = 'report' | 'enforce';

export type InternalHeaderSignatureStatus =
  | 'valid'
  | 'missing'
  | 'invalid'
  | 'expired'
  | 'no-secret';

type HeaderBag = IncomingHttpHeaders | OutgoingHttpHeaders;

const SIGNATURE_VERSION = 'v1';
// Covers the router's 300s request timeout plus clock skew between hosts.
const SIGNATURE_TTL_MS = 10 * 60 * 1000;
const SIGNING_KEY_CONTEXT = 'erxes-internal-header-signature';
const WARN_INTERVAL_MS = 60 * 1000;

const IDENTITY_SCOPE = 'identity';

export const getInternalHeaderSignatureMode = (): InternalHeaderSignatureMode =>
  (process.env[internalHeaderSignatureEnvName] || '').trim().toLowerCase() ===
  'enforce'
    ? 'enforce'
    : 'report';

const getSigningKey = (): Buffer | null => {
  const secret = process.env.JWT_TOKEN_SECRET;

  if (!secret || secret.trim() === '') {
    return null;
  }

  // Derived so this HMAC never shares a key with JWTs or the agent-tools header.
  return createHmac('sha256', secret).update(SIGNING_KEY_CONTEXT).digest();
};

const computeSignature = (
  key: Buffer,
  scope: string,
  issuedAt: number,
  values: string[],
) =>
  createHmac('sha256', key)
    .update(JSON.stringify([SIGNATURE_VERSION, scope, issuedAt, ...values]))
    .digest('base64url');

const lastWarnedAt = new Map<string, number>();

const warnRateLimited = (key: string, message: string) => {
  const now = Date.now();

  if (now - (lastWarnedAt.get(key) ?? 0) < WARN_INTERVAL_MS) {
    return;
  }

  lastWarnedAt.set(key, now);
  console.warn(`[internal-header-signature] ${message}`);
};

/**
 * Sign `values` for `scope`. Returns null when JWT_TOKEN_SECRET is not set.
 */
export const createInternalHeaderSignature = (
  scope: string,
  values: string[],
  now: number = Date.now(),
): string | null => {
  const key = getSigningKey();

  if (!key) {
    warnRateLimited(
      `sign:${scope}`,
      `JWT_TOKEN_SECRET is not set; ${scope} headers are sent unsigned.`,
    );
    return null;
  }

  return `${SIGNATURE_VERSION}.${now}.${computeSignature(
    key,
    scope,
    now,
    values,
  )}`;
};

export const verifyInternalHeaderSignature = (
  signatureHeader: unknown,
  scope: string,
  values: string[],
  now: number = Date.now(),
): InternalHeaderSignatureStatus => {
  const key = getSigningKey();

  if (!key) {
    return 'no-secret';
  }

  if (typeof signatureHeader !== 'string' || signatureHeader === '') {
    return 'missing';
  }

  const parts = signatureHeader.split('.');

  if (
    parts.length !== 3 ||
    parts[0] !== SIGNATURE_VERSION ||
    !/^\d{1,15}$/.test(parts[1])
  ) {
    return 'invalid';
  }

  const issuedAt = Number(parts[1]);
  const received = Buffer.from(parts[2]);
  const expected = Buffer.from(computeSignature(key, scope, issuedAt, values));

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return 'invalid';
  }

  if (Math.abs(now - issuedAt) > SIGNATURE_TTL_MS) {
    return 'expired';
  }

  return 'valid';
};

/**
 * Apply the configured mode to a verification result: true when the header
 * may be trusted. Every non-valid result is logged (rate limited).
 */
export const isInternalHeaderSignatureAccepted = (
  scope: string,
  status: InternalHeaderSignatureStatus,
): boolean => {
  if (status === 'valid') {
    return true;
  }

  const mode = getInternalHeaderSignatureMode();
  const reason =
    status === 'no-secret'
      ? 'JWT_TOKEN_SECRET is not set, so its signature cannot be verified'
      : `its signature is ${status}`;

  if (mode === 'enforce') {
    warnRateLimited(
      `verify:${scope}:${status}:${mode}`,
      `Rejected an internal ${scope} header: ${reason} (${internalHeaderSignatureEnvName}=enforce).`,
    );
    return false;
  }

  warnRateLimited(
    `verify:${scope}:${status}:${mode}`,
    `Accepted an internal ${scope} header although ${reason} (${internalHeaderSignatureEnvName}=report). ` +
      `Set ${internalHeaderSignatureEnvName}=enforce once the gateway and every service sign internal headers.`,
  );
  return true;
};

const readHeader = (headers: HeaderBag, name: string): string => {
  const value = headers[name];

  if (value === undefined || value === null) {
    return '';
  }

  return Array.isArray(value) ? value.join(', ') : String(value);
};

/**
 * Tenant derived the same way as `getSubdomain` for a request that carries
 * the gateway's hostname headers. Binding it into the identity signature
 * stops a signed identity from being replayed against another tenant.
 */
export const getSubdomainFromHeaders = (headers: HeaderBag): string => {
  const hostname =
    readHeader(headers, 'nginx-hostname') || readHeader(headers, 'hostname');

  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

const identityValues = (headers: HeaderBag): string[] => [
  getSubdomainFromHeaders(headers),
  ...SIGNED_IDENTITY_HEADERS.map((name) => readHeader(headers, name)),
];

/**
 * Signature for the identity headers in `headers` as they will be sent.
 * Returns null when there is no identity to sign or no secret to sign with.
 */
export const signIdentityHeaders = (headers: HeaderBag): string | null => {
  if (SIGNED_IDENTITY_HEADERS.every((name) => !readHeader(headers, name))) {
    return null;
  }

  return createInternalHeaderSignature(IDENTITY_SCOPE, identityValues(headers));
};

export const verifyIdentityHeaders = (
  headers: IncomingHttpHeaders,
): InternalHeaderSignatureStatus =>
  verifyInternalHeaderSignature(
    headers[identitySignatureHeaderName],
    IDENTITY_SCOPE,
    identityValues(headers),
  );

export const isIdentityHeaderTrusted = (headers: IncomingHttpHeaders) =>
  isInternalHeaderSignatureAccepted(
    IDENTITY_SCOPE,
    verifyIdentityHeaders(headers),
  );

/**
 * Remove identity headers that are not trusted under the configured mode, so
 * code reading a raw header (e.g. `userid`) cannot act on a forged one. A
 * no-op in report mode.
 */
export const dropUntrustedIdentityHeaders = (headers: IncomingHttpHeaders) => {
  if (SIGNED_IDENTITY_HEADERS.every((name) => headers[name] === undefined)) {
    return;
  }

  if (isIdentityHeaderTrusted(headers)) {
    return;
  }

  for (const name of SIGNED_IDENTITY_HEADERS) {
    delete headers[name];
  }

  delete headers[identitySignatureHeaderName];
};
