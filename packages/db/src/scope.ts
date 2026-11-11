import { AsyncLocalStorage } from 'node:async_hooks';
import type { PgTransaction } from 'drizzle-orm/pg-core';

/** The transaction a tenant scope runs in, and whose data it may see. */
export interface TenantScope {
  // Typed loosely here to avoid a cycle with ./client; `db()` casts it.
  tx: PgTransaction<any, any, any>;
  /** The organisation, or null for system work (jobs that span organisations). */
  orgId: string | null;
  reason?: string;
}

export const scopeStorage = new AsyncLocalStorage<TenantScope>();

export const currentScope = () => scopeStorage.getStore();
