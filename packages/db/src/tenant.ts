import { sql } from 'drizzle-orm';
import { rootDb } from './client';
import type { Transaction } from './types';
import {
  type Caller,
  currentScope,
  openScope,
  type RowLimits,
  scopeStorage,
  system,
} from './scope';

const limitList = (ids: readonly string[] | null) => (ids === null ? '' : ids.join(',') || '-');

const rowLimitsOf = (who: Caller) => (who.type === 'user' ? who.key?.rows : undefined);

/**
 * A key's row limits (`RowLimits`) for the transaction. Row level security on contacts reads
 * them as erxes_core_keyed (drizzle/0109_key_row_role.sql), which the transaction becomes in the
 * same statement, so a key never runs without its limits and other callers never pay for them.
 * Empty settings mean no limit; `-` matches no id.
 */
const rowLimitSettings = (rows: RowLimits) =>
  sql`set_config('role', 'erxes_core_keyed', true), set_config('app.key_owners', ${limitList(rows.owners)}, true), set_config('app.key_tags', ${limitList(rows.tags)}, true)`;

const NO_LIMIT_SETTINGS = sql`set_config('app.key_owners', '', true), set_config('app.key_tags', '', true)`;

const applyRowLimits = (tx: Transaction, rows: RowLimits) =>
  tx.execute(sql`select ${rowLimitSettings(rows)}`);

/** No row limits, as the connection's own role again. */
const clearRowLimits = async (tx: Transaction) => {
  await tx.execute(sql`reset role`);
  await tx.execute(sql`select ${NO_LIMIT_SETTINGS}`);
};

/**
 * Starts the transaction's work for the organisation, in one statement: its id for row level
 * security, the key's row limits, and no JIT compilation. Row level security puts a subquery
 * on every contact row, so the planner prices even a 100-row page above `jit_above_cost`, and
 * compiling took 70–230 ms of queries that run in a few.
 */
const enterOrg = (tx: Transaction, orgId: string, rows: RowLimits | undefined) =>
  tx.execute(
    sql`select set_config('app.org_id', ${orgId}, true), set_config('jit', 'off', true)${rows ? sql`, ${rowLimitSettings(rows)}` : sql``}`,
  );

/** Runs `fn` in a savepoint that sees only the rows `rows` leaves (checking what a key would see). */
export const withRowLimits = <T>(rows: RowLimits, fn: (tx: Transaction) => Promise<T>) => {
  const current = openScope();

  if (!current) throw new Error('withRowLimits() needs a withOrg scope');

  return current.tx.transaction(async (sp) => {
    await applyRowLimits(sp, rows);

    const result = await fn(sp);
    const own = rowLimitsOf(current.caller);

    await (own ? applyRowLimits(sp, own) : clearRowLimits(sp));

    return result;
  });
};

/** The caller a new transaction keeps: the request's, or core's own outside a request. */
const callerFor = (reason: string) => currentScope()?.caller ?? system(reason);

/**
 * Tenant isolation. Every core table with `org_id` has row level security
 * (forced, so the table owner obeys it too): a row is visible and writable
 * only when the transaction says it works for that organisation
 * (`app.org_id`, set locally with `set_config(…, true)`). System work, jobs
 * that span organisations, acts as `erxes_core_system` (`SET LOCAL ROLE`),
 * which bypasses row level security. Both are transaction-local, so a pooled
 * connection never carries them over.
 *
 * - `withOrg(orgId, fn)`: everything `db()` does inside runs in one
 *   transaction for that organisation (every API request does this).
 * - `withSystem(reason, fn)`: the same, across organisations, for jobs and
 *   the few lookups before an organisation is known (sign-in discovery).
 *
 * Nested calls reuse the open transaction; asking for another organisation
 * inside a scope is a bug and throws. `withOrg` inside `withSystem` narrows:
 * `fn` runs in a savepoint as the runtime role for that organisation (an
 * event consumer handling one organisation's event), and the system scope
 * carries on after it.
 */
export const withOrg = async <T>(
  orgId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> => {
  const current = openScope();

  if (current?.orgId === orgId) return fn(current.tx);

  if (current?.orgId) {
    throw new Error(`tenant scope mismatch: in ${current.orgId}, asked for ${orgId}`);
  }

  if (current) {
    return current.tx.transaction(async (sp) => {
      // RESET ROLE goes back to the connection's role (the runtime role). On
      // an error the savepoint's rollback undoes both settings.
      await sp.execute(sql`reset role`);
      const rows = rowLimitsOf(current.caller);

      await enterOrg(sp, orgId, rows);

      const result = await scopeStorage.run({ ...current, tx: sp, orgId }, () => fn(sp));

      await sp.execute(
        sql`select set_config('app.org_id', '', true)${rows ? sql`, ${NO_LIMIT_SETTINGS}` : sql``}`,
      );
      await sp.execute(sql`set local role erxes_core_system`);

      return result;
    });
  }

  const who = callerFor('background');

  return rootDb().transaction(async (tx) => {
    await enterOrg(tx, orgId, rowLimitsOf(who));

    return scopeStorage.run({ caller: who, tx, orgId }, () => fn(tx));
  });
};

export const withSystem = async <T>(
  reason: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> => {
  const current = openScope();

  if (current) {
    if (current.orgId !== null) {
      throw new Error(`system scope (${reason}) asked for inside the scope of ${current.orgId}`);
    }

    return fn(current.tx);
  }

  const who = callerFor(reason);

  return rootDb().transaction(async (tx) => {
    // drizzle/0052_system_role.sql; core_grant_runtime lets the runtime role take it.
    await tx.execute(sql`set local role erxes_core_system`);

    return scopeStorage.run({ caller: who, tx, orgId: null }, () => fn(tx));
  });
};

/**
 * Everything in a scope is already one transaction: its writes are saved
 * together or not at all, so services never open another. `savepoint(fn)` is
 * for an error the caller handles: when `fn` throws, only its own writes roll
 * back and the scope's transaction stays usable, to look up what conflicted or
 * to go on with the next item.
 */
export const savepoint = <T>(fn: (tx: Transaction) => Promise<T>) => {
  const current = openScope();

  if (!current) throw new Error('savepoint() needs a withOrg or withSystem scope');

  // The savepoint becomes the scope's transaction, so a savepoint inside it
  // nests (its own name) instead of reusing this one's.
  return current.tx.transaction((sp) => scopeStorage.run({ ...current, tx: sp }, () => fn(sp)));
};

/**
 * A transaction of its own for the organisation, even inside another scope:
 * for what must be saved although the surrounding work is rolled back (a
 * guard that refuses the request but records why). The caller stays.
 */
export const withOrgDetached = <T>(
  orgId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> =>
  scopeStorage.run({ caller: callerFor('background'), orgId, tx: null }, () => withOrg(orgId, fn));

/** The organisation of the current scope (null for system scopes and outside any). */
export const scopedOrgId = () => currentScope()?.orgId ?? null;

/**
 * The scope's organisation where it is real data (a storage key, a lock key)
 * or where a procedure opens its own `withOrg` (customers, calls out over the
 * network). Throws outside one: the access policy only lets in callers of an
 * organisation, so that is a bug.
 */
export const requestOrgId = () => {
  const orgId = scopedOrgId();

  if (!orgId) throw new Error('requestOrgId() outside an organisation scope');

  return orgId;
};

/**
 * Who the database sees us as. Production refuses a role that bypasses row
 * level security (a superuser or BYPASSRLS): isolation would be off.
 */
export const runtimeRole = async () => {
  const result = await rootDb().execute<{ name: string; bypass: boolean; superuser: boolean }>(sql`
    select current_user as name, r.rolbypassrls as bypass, r.rolsuper as superuser
    from pg_roles r where r.rolname = current_user
  `);

  const row = result.rows[0];

  return {
    name: row?.name ?? 'unknown',
    bypassesRls: Boolean(row?.bypass) || Boolean(row?.superuser),
  };
};
