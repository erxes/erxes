import { IncomingHttpHeaders } from 'node:http';
import { signServicePayload, verifyServiceToken } from '../service-signature';

export const agentToolsAuthHeaderName = 'x-erxes-agent-auth';

// Signed payloads carry an issue timestamp and expire quickly so a captured
// header cannot be replayed indefinitely inside the internal network.
const AUTH_TTL_MS = 5 * 60 * 1000;

export interface AgentToolsAuthPayload {
  subdomain: string;
  userId: string | null;
  threadId?: string;
}

/**
 * Mint a signed agent-tools auth header binding the given tenant (and
 * optionally the acting user) into a tamper-proof credential. Signed with the
 * shared service secret (`service-signature.ts`): signing throws and verifying
 * fails closed until JWT_TOKEN_SECRET is configured.
 */
export const encodeAgentToolsAuthHeader = (
  subdomain: string,
  userId?: string,
  meta?: { threadId?: string },
): string => {
  const threadId =
    typeof meta?.threadId === 'string' && meta.threadId !== ''
      ? meta.threadId
      : undefined;

  const payloadBase64 = Buffer.from(
    JSON.stringify({
      subdomain,
      userId: userId || null,
      at: Date.now(),
      ...(threadId ? { threadId } : {}),
    }),
    'utf8',
  ).toString('base64url');

  return `${payloadBase64}.${signServicePayload(payloadBase64)}`;
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

  const payload = verifyServiceToken(header);

  if (!payload) {
    return null;
  }

  if (typeof payload.subdomain !== 'string' || !payload.subdomain) {
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
    ...(typeof payload.threadId === 'string' && payload.threadId !== ''
      ? { threadId: payload.threadId }
      : {}),
  };
};
