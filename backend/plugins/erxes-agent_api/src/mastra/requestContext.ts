import { AsyncLocalStorage } from 'async_hooks';

// Propagates auth headers through the entire async call chain.
// Any tool executed within runWithAuth() automatically inherits the context.

interface RequestAuth {
  userHeader?: string;
  token?: string;
  /** Tenant of the request — required by tools that query tenant-partitioned stores (Qdrant). */
  subdomain?: string;
}

const authStorage = new AsyncLocalStorage<RequestAuth>();

/** Run fn with the given auth visible to every async callee (tools, fetches). */
export function runWithAuth<T>(
  ctx: RequestAuth,
  fn: () => Promise<T>,
): Promise<T> {
  return authStorage.run(ctx, fn);
}

/** The auth context of the current async chain, when inside runWithAuth. */
export function getCurrentAuth(): RequestAuth | undefined {
  return authStorage.getStore();
}
