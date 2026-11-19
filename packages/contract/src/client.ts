import { createORPCClient, ORPCError } from '@orpc/client';
import type { ContractRouterClient, ORPCErrorFromErrorMap } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import DataLoader from 'dataloader';
import type { ERRORS, ErrorCode } from './errors';
import type { coreContract } from './index';
import { coreRoutes } from './routes';
import { CORE_API_PREFIX } from './values';

/**
 * The browser's typed client for /core/v1, from the contract the server implements. web and
 * plugin UIs both import it. They are served from web's origin, so the HttpOnly session cookie
 * goes with every request. Calls return the result or throw an `ORPCError` (`code`, `status`,
 * `data`). It imports no table: the routes come from `routes.json` and the types stay types.
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
 * request is cached once wherever it's used, in web and in a plugin (they share
 * web's QueryClient), and `invalidateQueries({ queryKey: orpc.users.key() })`
 * reaches every users query. Never write a query key by hand.
 */
export const orpc = createTanstackQueryUtils(client);

/**
 * Where erxes-ui's member pickers and `useMembersById` read members:
 * `<SelectMember.Field members={memberQueries} … />`. The active team is one
 * request and cache entry for every picker and name in web and its plugins.
 */
export const memberQueries = {
  team: orpc.users.list.queryOptions({
    input: { limit: 100, status: 'active' },
    staleTime: 60_000,
  }),
  byIds: (ids: string[]) =>
    orpc.users.list.queryOptions({
      input: { ids: ids.join(','), limit: 100 },
      staleTime: 5 * 60_000,
    }),
};

/**
 * Reads records by id with one list request for all the ids asked for in the same task, up to
 * 100. An id the list doesn't return (merged into another record, or gone) is read on its own,
 * so it resolves or fails as `get` does. React Query caches the rows, so the loader doesn't.
 */
const loaderById = <Row extends { id: string }>(
  list: (ids: string) => Promise<{ data: Row[] }>,
  get: (id: string) => Promise<Row>,
) =>
  new DataLoader<string, Row>(
    async (ids) => {
      const { data } = await list(ids.join(','));
      const found = new Map(data.map((row) => [row.id, row]));

      // An Error in the list fails that id's lookup only.
      return Promise.all(
        ids.map(async (id) => {
          const row = found.get(id);

          if (row) return row;

          return get(id).catch((error: unknown) =>
            error instanceof Error ? error : new Error(String(error)),
          );
        }),
      );
    },
    { cache: false, maxBatchSize: 100 },
  );

const customerLoader = loaderById(
  (ids) => client.customers.list({ ids, limit: 100 }),
  (id) => client.customers.get({ id }),
);

const companyLoader = loaderById(
  (ids) => client.companies.list({ ids, limit: 100 }),
  (id) => client.companies.get({ id }),
);

const memberLoader = loaderById(
  (ids) => client.users.list({ ids, limit: 100 }),
  (id) => client.users.get({ id }),
);

/**
 * One team member by id, with their role and status. It is cached under the query the member's
 * panel reads, and the members one page asks for load together in one request.
 */
export const memberQuery = (id: string) => ({
  ...orpc.users.get.queryOptions({ input: { id }, staleTime: 60_000 }),
  queryFn: () => memberLoader.load(id),
});

/**
 * Where erxes-ui's `ContactLink` reads a customer or company:
 * `<ContactLink contentType="core:customer" contentId={id} contacts={contactQueries} />`.
 * Each is cached under the query web's panel reads, so a name edited there shows in every
 * link, while the links on one page load together in one request.
 */
export const contactQueries = {
  customer: (id: string) => ({
    ...orpc.customers.get.queryOptions({ input: { id }, staleTime: 60_000 }),
    queryFn: () => customerLoader.load(id),
  }),
  company: (id: string) => ({
    ...orpc.companies.get.queryOptions({ input: { id }, staleTime: 60_000 }),
    queryFn: () => companyLoader.load(id),
  }),
};

/**
 * Where erxes-ui's list filter searches customers and companies for `customer` and `company`
 * fields: `<ListFilter contacts={contactSearchQueries} … />`. A rule's picked contacts load by id.
 */
export const contactSearchQueries = {
  customers: ({ search, ids }: { search?: string; ids?: string[] }) =>
    orpc.customers.list.queryOptions({
      input: { limit: ids ? 100 : 20, search, ids: ids?.join(',') },
      staleTime: 60_000,
    }),
  companies: ({ search, ids }: { search?: string; ids?: string[] }) =>
    orpc.companies.list.queryOptions({
      input: { limit: ids ? 100 : 20, search, ids: ids?.join(',') },
      staleTime: 60_000,
    }),
};

/**
 * Where erxes-ui's list filter searches products for `product` fields (a plugin relation's
 * "Product is"): `<ListFilter products={productSearchQueries} … />`. Picked products load by id,
 * archived ones too.
 */
export const productSearchQueries = {
  search: (search: string | undefined) =>
    orpc.products.list.queryOptions({ input: { limit: 20, search, all: true }, staleTime: 60_000 }),
  byIds: (ids: string[]) =>
    orpc.products.lookup.queryOptions({ input: { ids: ids.join(',') }, staleTime: 5 * 60_000 }),
};

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
