import { type AnyContractRouter, isContractProcedure } from '@orpc/contract';
import routes from '../routes.json';

const isRouter = (value: unknown): value is AnyContractRouter =>
  isContractProcedure(value) ||
  (typeof value === 'object' && value !== null && Object.values(value).every(isRouter));

if (!isRouter(routes)) throw new Error('routes.json is not a contract router: run pnpm openapi');

/**
 * Every procedure's method and path, without its schemas (`pnpm openapi` writes
 * routes.json). Pass it to `OpenAPILink` and type the client with
 * `ContractRouterClient<typeof coreContract>` from an `import type`: the client
 * then loads no table and no drizzle.
 */
export const coreRoutes: AnyContractRouter = routes;
