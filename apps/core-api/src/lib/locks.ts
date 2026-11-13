import type { Db } from '@erxes/core-db';
import { sql } from 'drizzle-orm';

/**
 * Row locks for read-modify-write inside the request's transaction: whoever
 * comes second waits, then reads what the first one wrote (no lost updates).
 * Ids are locked in a fixed order, so two callers can't deadlock.
 */
export const lockRows = async (
  client: Db,
  table: 'core_customers' | 'core_companies' | 'core_fields' | 'core_files' | 'core_products',
  orgId: string,
  ids: string[],
) => {
  if (!ids.length) return;

  await client.execute(sql`
    select 1 from ${sql.identifier(table)}
    where org_id = ${orgId} and id in (${sql.join(
      ids.map((id) => sql`${id}`),
      sql`, `,
    )})
    order by id
    for update
  `);
};

/**
 * Serialises changes to who runs an organisation (roles, disabling): two
 * owners demoting each other at once can't leave it without an owner.
 */
export const lockOrganization = (client: Db, orgId: string) =>
  client.execute(sql`select 1 from core_organizations where id = ${orgId} for update`);

/** A transaction-scoped lock on any key (released at commit or rollback). */
export const lockKey = (client: Db, key: string) =>
  client.execute(sql`select pg_advisory_xact_lock(hashtext(${key}))`);
