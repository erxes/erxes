import { type Db, dataTables } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { schemaOf } from './columns';

/** How long a custom record stays in the recycle bin. */
const KEPT_DAYS = 30;

/**
 * Housekeeping (system scope): custom records in the recycle bin 30 days are deleted for good,
 * every organisation's, and their links go with them (the tables' foreign keys).
 */
export const purgeDeletedRecords = async (client: Db) => {
  const tables = await client
    .select({ orgId: dataTables.orgId, tableName: dataTables.tableName })
    .from(dataTables)
    .where(eq(dataTables.kind, 'object'));

  let removed = 0;

  await inOrder(tables, async ({ orgId, tableName }) => {
    const result = await client.execute(
      sql`delete from ${sql.identifier(schemaOf(orgId))}.${sql.identifier(tableName)}
        where deleted_at < now() - make_interval(days => ${KEPT_DAYS})`,
    );

    removed += result.rowCount ?? 0;
  });

  return removed;
};
