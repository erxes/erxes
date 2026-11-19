import { sql } from 'drizzle-orm';
import { rootDb } from './client';
import type { Transaction } from './types';
import { type Caller, currentScope, openScope, type Reach, scopeStorage, system } from './scope';

/**
 * The settings the database reads about a caller (drizzle/0090_reach.sql). Row level security
 * limits their rows by a member's reach, then by an API key's own limits inside it. A record
 * they make without naming its units or owner starts in `app.units`, owned by `app.owner`.
 */
const LIMIT_SETTINGS = [
  'app.reach',
  'app.key',
  'app.key_owners',
  'app.key_units',
  'app.key_tags',
  'app.units',
  'app.owner',
] as const;

type Limits = Record<(typeof LIMIT_SETTINGS)[number], string>;

/**
 * A setting's list as a Postgres array of a row's `visible_to` keys (`o:<owner>`, `e:<unit>`,
 * `u:<unit>`) or of plain ids; '' for no limit, while `{}` matches no row.
 */
const limitList = (ids: readonly string[] | null, prefix = '') =>
  ids === null
    ? ''
    : `{${ids.map((id) => `"${prefix}${id.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`).join(',')}}`;

/** A member's reach as the keys a row must have one of. */
const reachKeys = (userId: string, { level, unitIds }: Reach) => {
  switch (level) {
    case 'organization':
      return '';
    case 'subtree':
      return limitList(unitIds, 'u:');
    case 'unit':
      return limitList(unitIds, 'e:');
    case 'own':
      return limitList([userId], 'o:');
  }
};

/**
 * The rows a caller is limited to. A member with `own` reach sees the records they own, with
 * `unit` those in their units, with `subtree` those in a unit under them too; a regular or
 * management key adds its own limits inside that. Plugins, customers and core itself have none.
 * What a member makes starts in their units (a key's own, when it is limited to some), and is
 * theirs when they reach only their own records.
 */
const limitsOf = (who: Caller): Limits => {
  const member = who.type === 'user' ? who : undefined;
  const rows = member?.key?.rows;
  const units = rows?.units ?? member?.reach.unitIds ?? [];

  return {
    'app.reach': member ? reachKeys(member.userId, member.reach) : '',
    'app.key': rows ? 'on' : '',
    'app.key_owners': limitList(rows?.owners ?? null, 'o:'),
    'app.key_units': limitList(rows?.units ?? null, 'u:'),
    'app.key_tags': limitList(rows?.tags ?? null),
    'app.units': units.length ? limitList(units) : '',
    'app.owner': member?.reach.level === 'own' ? member.userId : '',
  };
};

const NO_LIMITS = limitsOf(system('no limits'));

const sameLimits = (one: Limits, other: Limits) =>
  LIMIT_SETTINGS.every((name) => one[name] === other[name]);

/** Sets the limits for the transaction; they go with it, or with the savepoint that set them. */
const applyLimits = (tx: Transaction, limits: Limits) =>
  tx.execute(
    sql`select ${sql.join(
      LIMIT_SETTINGS.map((name) => sql`set_config(${name}, ${limits[name]}, true)`),
      sql`, `,
    )}`,
  );

/**
 * Runs `fn` as `who`, in the current organisation and transaction: a sign-in acting for the
 * member it found, an automation or an import for the member who started it, core recording
 * what it did on its own inside a member's request. The rows `who` is limited to come along:
 * when they differ from the scope's, `fn` runs in a savepoint that sees `who`'s rows, so a job
 * never reads more than its member and core's own work is not held to the member's reach.
 */
export const runAs = async <T>(who: Caller, fn: () => T | Promise<T>): Promise<T> => {
  const current = currentScope();
  const scope = { caller: who, orgId: current?.orgId ?? null, tx: current?.tx ?? null };

  // Outside a transaction `withOrg` sets them when it opens one. Across organisations the
  // system role bypasses row level security.
  if (!current?.tx || !current.orgId) return scopeStorage.run(scope, fn);

  const limits = limitsOf(who);
  const before = limitsOf(current.caller);

  if (sameLimits(limits, before)) return scopeStorage.run(scope, fn);

  return current.tx.transaction(async (sp) => {
    await applyLimits(sp, limits);

    const result = await scopeStorage.run({ ...scope, tx: sp }, fn);

    await applyLimits(sp, before);

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
      await sp.execute(sql`select set_config('app.org_id', ${orgId}, true)`);
      const limits = limitsOf(current.caller);
      const limited = !sameLimits(limits, NO_LIMITS);

      if (limited) await applyLimits(sp, limits);

      const result = await scopeStorage.run({ ...current, tx: sp, orgId }, () => fn(sp));

      await sp.execute(sql`select set_config('app.org_id', '', true)`);

      if (limited) await applyLimits(sp, NO_LIMITS);
      await sp.execute(sql`set local role erxes_core_system`);

      return result;
    });
  }

  const who = callerFor('background');

  return rootDb().transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.org_id', ${orgId}, true)`);
    const limits = limitsOf(who);

    // A new transaction has none set.
    if (!sameLimits(limits, NO_LIMITS)) await applyLimits(tx, limits);

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
