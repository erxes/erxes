import { CORE_API_PREFIX, coreContract } from '@erxes/core-contract';
import { createORPCClient, ORPCError } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { z } from 'zod';

/**
 * Typed client for /core/v1 from the same contract the server implements.
 * Same origin, so the HttpOnly session cookie goes with every request.
 * Calls return the result or throw an `ORPCError` (`code`, `status`, `data`).
 */
const client: ContractRouterClient<typeof coreContract> = createORPCClient(
  new OpenAPILink(coreContract, {
    url: () => `${window.location.origin}${CORE_API_PREFIX}`,
    fetch: (request, init) => globalThis.fetch(request, { ...init, credentials: 'same-origin' }),
  }),
);

/**
 * Every core call: `orpc.users.list.queryOptions({ input })`,
 * `orpc.users.update.mutationOptions()`, or `orpc.files.complete.call(input)`
 * outside React Query. The key is the procedure and its input, so the same
 * request is cached once wherever it's used, and
 * `invalidateQueries({ queryKey: orpc.users.key() })` reaches every users query.
 * Never write a query key by hand.
 */
export const orpc = createTanstackQueryUtils(client);

/** A core error, optionally with a given code (`CUSTOMER_EXISTS`, …). */
export const isApiError = (error: unknown, code?: string): error is ORPCError<string, unknown> =>
  error instanceof ORPCError && (code === undefined || error.code === code);

/** A core error's `data`, when it has the shape `schema` describes. */
export const errorData = <T>(error: unknown, schema: z.ZodType<T, z.ZodTypeDef, unknown>) => {
  if (!isApiError(error)) return undefined;

  const parsed = schema.safeParse(error.data);

  return parsed.success ? parsed.data : undefined;
};

export const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Try again.';
