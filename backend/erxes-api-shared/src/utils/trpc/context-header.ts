import { IncomingHttpHeaders } from 'http';
import type { CommonTRPCContext } from '.';
import {
  createInternalHeaderSignature,
  isInternalHeaderSignatureAccepted,
  verifyInternalHeaderSignature,
} from '../headers/signature';

export const trpcContextHeaderName = 'x-trpc-context';
export const trpcContextSignatureHeaderName = 'x-trpc-context-signature';

const TRPC_CONTEXT_SCOPE = 'trpc-context';

export function encodeTRPCContextHeader(
  subdomain: string,
  method: 'query' | 'mutation',
  context: CommonTRPCContext | undefined,
): string {
  const contextData = {
    subdomain,
    method,
    ...context,
  };
  const contextJson = JSON.stringify(contextData);
  return Buffer.from(contextJson, 'utf8').toString('base64');
}

/**
 * Decode the base64 JSON tRPC context header into tenant, method, and caller
 * context. Returns null when the header is absent or malformed. Note: the
 * header is an encoding, not an authentication credential.
 */
export function decodeTRPCContextHeader(headers: IncomingHttpHeaders): {
  subdomain: string;
  method: 'query' | 'mutation';
  context: CommonTRPCContext;
} | null {
  const contextHeader = headers[trpcContextHeaderName];
  if (!contextHeader) {
    return null;
  }
  if (Array.isArray(contextHeader)) {
    throw new Error(`Multiple ${trpcContextHeaderName} headers`);
  }
  try {
    const contextJson = Buffer.from(contextHeader, 'base64').toString('utf-8');
    const decoded = JSON.parse(contextJson);
    const { subdomain, method, ...context } = decoded;
    return { subdomain, method, context };
  } catch {
    return null;
  }
}

/**
 * Headers for an internal tRPC call: the encoded context plus its signature
 * (omitted when JWT_TOKEN_SECRET is not set). Build them per request so the
 * signature timestamp stays fresh.
 */
export function getTRPCContextHeaders(
  subdomain: string,
  method: 'query' | 'mutation',
  context: CommonTRPCContext | undefined,
): Record<string, string> {
  const contextHeader = encodeTRPCContextHeader(subdomain, method, context);
  const signature = createInternalHeaderSignature(TRPC_CONTEXT_SCOPE, [
    contextHeader,
  ]);

  return {
    [trpcContextHeaderName]: contextHeader,
    ...(signature ? { [trpcContextSignatureHeaderName]: signature } : {}),
  };
}

/**
 * Whether the tRPC context header may be trusted under the configured
 * INTERNAL_HEADER_SIGNATURE mode.
 */
export function isTRPCContextHeaderTrusted(
  headers: IncomingHttpHeaders,
): boolean {
  const contextHeader = headers[trpcContextHeaderName];

  return isInternalHeaderSignatureAccepted(
    TRPC_CONTEXT_SCOPE,
    verifyInternalHeaderSignature(
      headers[trpcContextSignatureHeaderName],
      TRPC_CONTEXT_SCOPE,
      [typeof contextHeader === 'string' ? contextHeader : ''],
    ),
  );
}
