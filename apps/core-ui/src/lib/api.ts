import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient, ORPCError } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';

/**
 * Typed client for /core/v1 from the same contract the server implements.
 * Same origin, so the HttpOnly session cookie goes with every request.
 * Calls return the result or throw an `ORPCError` (`code`, `status`, `data`).
 */
export const api: ContractRouterClient<typeof coreContract> = createORPCClient(
  new OpenAPILink(coreContract, {
    url: () => `${window.location.origin}${CORE_API_PREFIX}`,
    fetch: (request, init) => globalThis.fetch(request, { ...init, credentials: 'same-origin' }),
  }),
);

/** A core error, optionally with a given code (`CUSTOMER_EXISTS`, …). */
export const isApiError = (error: unknown, code?: string): error is ORPCError<string, unknown> =>
  error instanceof ORPCError && (code === undefined || error.code === code);

export const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Try again.';
