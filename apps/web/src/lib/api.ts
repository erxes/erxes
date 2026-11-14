import {
  CORE_API_PREFIX,
  type coreContract,
  type ERRORS,
  type ErrorCode,
} from '@erxes/core-contract';
import { coreRoutes } from '@erxes/core-contract/routes';
import { createORPCClient, ORPCError } from '@orpc/client';
import type { ContractRouterClient, ORPCErrorFromErrorMap } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

/**
 * Typed client for /core/v1 from the same contract the server implements.
 * Same origin, so the HttpOnly session cookie goes with every request.
 * Calls return the result or throw an `ORPCError` (`code`, `status`, `data`).
 */
const client: ContractRouterClient<typeof coreContract> = createORPCClient(
  new OpenAPILink(coreRoutes, {
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

/** Any error core answers with: one per code in `ERRORS`, with that code's `data`. */
type ApiError = ORPCErrorFromErrorMap<typeof ERRORS>;

/**
 * Whether core answered with `code` (`TAKEN`, `NOT_FOUND`, …). It narrows
 * `error.data` to what `ERRORS` declares for the code, so the field a
 * `TAKEN` is about reads as `error.data.field`.
 */
export const isApiError = <C extends ErrorCode>(
  error: unknown,
  code: C,
): error is Extract<ApiError, { code: C }> =>
  error instanceof ORPCError && error.defined && error.code === code;

/** What to tell the member: the error's message, or the first field the contract refused. */
export const messageOf = (error: unknown) => {
  const issue = isApiError(error, 'INVALID_INPUT') ? error.data.issues[0] : undefined;

  if (issue) return `${issue.path.join('.')}: ${issue.message}`;

  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
};
