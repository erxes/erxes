import { sql } from 'drizzle-orm';
import { rootDb } from './client';
import type { Transaction } from './types';
import { currentScope, scopeStorage } from './scope';

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
  const current = currentScope();

  if (current?.orgId === orgId) return fn(current.tx);

  if (current?.orgId) {
    throw new Error(`tenant scope mismatch: in ${current.orgId}, asked for ${orgId}`);
  }

  if (current) {
    return current.tx.transaction(async (sp) => {
      // RESET ROLE goes back to the connection's role (the runtime role). On
      // an error the savepoint's rollback undoes both settings.
      await sp.execute(sql`reset role`);
      await sp.execute(sql`select set_config('app.org_id', ${orgId}, true)`);

      const result = await scopeStorage.run({ tx: sp, orgId }, () => fn(sp));

      await sp.execute(sql`select set_config('app.org_id', '', true)`);
      await sp.execute(sql`set local role erxes_core_system`);

      return result;
    });
  }

  return rootDb().transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.org_id', ${orgId}, true)`);

    return scopeStorage.run({ tx, orgId }, () => fn(tx));
  });
};

export const withSystem = async <T>(
  reason: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> => {
  const current = currentScope();

  if (current) {
    if (current.orgId !== null) {
      throw new Error(`system scope (${reason}) asked for inside the scope of ${current.orgId}`);
    }

    return fn(current.tx);
  }

  return rootDb().transaction(async (tx) => {
    // drizzle/0052_system_role.sql; core_grant_runtime lets the runtime role take it.
    await tx.execute(sql`set local role erxes_core_system`);

    return scopeStorage.run({ tx, orgId: null, reason }, () => fn(tx));
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
  const current = currentScope();

  if (!current) throw new Error('savepoint() needs a withOrg or withSystem scope');

  // The savepoint becomes the scope's transaction, so a savepoint inside it
  // nests (its own name) instead of reusing this one's.
  return current.tx.transaction((sp) => scopeStorage.run({ ...current, tx: sp }, () => fn(sp)));
};

/**
 * A transaction of its own for the organisation, even inside another scope:
 * for what must be saved although the surrounding work is rolled back (a
 * guard that refuses the request but records why).
 */
export const withOrgDetached = <T>(
  orgId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> => scopeStorage.exit(() => withOrg(orgId, fn));

/** The organisation of the current scope (null for system scopes and outside any). */
export const scopedOrgId = () => currentScope()?.orgId ?? null;

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
