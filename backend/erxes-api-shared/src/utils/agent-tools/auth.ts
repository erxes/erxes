import { createHmac, timingSafeEqual } from 'node:crypto';
import { IncomingHttpHeaders } from 'node:http';

export const agentToolsAuthHeaderName = 'x-erxes-agent-auth';

// Signed payloads carry an issue timestamp and expire quickly so a captured
// header cannot be replayed indefinitely inside the internal network.
const AUTH_TTL_MS = 5 * 60 * 1000;

export interface AgentToolsAuthPayload {
  subdomain: string;
  userId: string | null;
  oauthClientId?: string;
  oauthScopes?: string[];
}

/**
 * Secret used to sign/verify the agent-tools auth header. Every backend
 * service shares the auth JWT secret, so a header signed by one service
 * verifies in another.
 *
 * There is intentionally NO default value. A hardcoded fallback would let
 * anyone reproduce the HMAC and re-open the unauthenticated tool-execution
 * hole this signing is meant to close, so we fail closed: sign/verify throws
 * until JWT_TOKEN_SECRET is configured.
 */
const getAgentToolsSecret = (): string => {
  const secret = process.env.JWT_TOKEN_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_TOKEN_SECRET is required to sign and verify the agent-tools ' +
        'auth header used for service-to-service authentication. Set ' +
        'JWT_TOKEN_SECRET to the same value across all backend services.',
    );
  }

  return secret;
};

const signPayload = (payloadBase64: string): string =>
  createHmac('sha256', getAgentToolsSecret())
    .update(payloadBase64)
    .digest('base64url');

/**
 * Mint a signed agent-tools auth header binding the given tenant (and
 * optionally the acting user) into a tamper-proof credential.
 */
export const encodeAgentToolsAuthHeader = (
  subdomain: string,
  userId?: string,
  oauth?: { clientId?: string; scopes?: string[] },
): string => {
  const scopes = [...new Set(oauth?.scopes || [])].filter(
    (scope) => typeof scope === 'string' && scope.length <= 256,
  );
  const payloadBase64 = Buffer.from(
    JSON.stringify({
      subdomain,
      userId: userId || null,
      at: Date.now(),
      ...(oauth?.clientId ? { oauthClientId: oauth.clientId } : {}),
      ...(scopes.length ? { oauthScopes: scopes } : {}),
    }),
    'utf8',
  ).toString('base64url');

  return `${payloadBase64}.${signPayload(payloadBase64)}`;
};

/**
 * Verify the agent-tools auth header and return the bound identity. Returns
 * null when the header is missing, malformed, expired, or carries an invalid
 * signature — callers must treat null as unauthenticated.
 */
export const decodeAgentToolsAuthHeader = (
  headers: IncomingHttpHeaders,
): AgentToolsAuthPayload | null => {
  const header = headers[agentToolsAuthHeaderName];

  if (!header || Array.isArray(header)) {
    return null;
  }

  const separatorIndex = header.lastIndexOf('.');

  if (separatorIndex === -1) {
    return null;
  }

  const payloadBase64 = header.slice(0, separatorIndex);
  const signature = header.slice(separatorIndex + 1);

  let expectedSignature: string;

  try {
    expectedSignature = signPayload(payloadBase64);
  } catch {
    // Secret not configured — fail closed.
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
    const payload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8'),
    );

    if (
      !payload ||
      typeof payload.subdomain !== 'string' ||
      !payload.subdomain
    ) {
      return null;
    }

    if (
      typeof payload.at !== 'number' ||
      Math.abs(Date.now() - payload.at) > AUTH_TTL_MS
    ) {
      return null;
    }

    return {
      subdomain: payload.subdomain,
      userId: typeof payload.userId === 'string' ? payload.userId : null,
      ...(typeof payload.oauthClientId === 'string'
        ? { oauthClientId: payload.oauthClientId }
        : {}),
      ...(Array.isArray(payload.oauthScopes) &&
      payload.oauthScopes.length <= 512 &&
      payload.oauthScopes.every(
        (scope: unknown) => typeof scope === 'string' && scope.length <= 256,
      )
        ? { oauthScopes: payload.oauthScopes }
        : {}),
    };
  } catch {
    return null;
  }
};
