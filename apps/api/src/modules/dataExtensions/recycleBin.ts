import { dataTables, withOrg, withSystem } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { schemaOf } from './columns';

/** How long a custom record stays in the recycle bin. */
const KEPT_DAYS = 30;

/**
 * Housekeeping: custom records in the recycle bin 30 days are deleted for good, every
 * organisation's, and their links go with them (the tables' foreign keys). Each organisation
 * commits on its own, so the job holds one organisation's locks at a time: one transaction over
 * all of them would fill Postgres's lock table and fail other organisations' requests.
 */
export const purgeDeletedRecords = async () => {
  const tables = await withSystem('cleanup: custom records recycle bin', (tx) =>
    tx
      .select({ orgId: dataTables.orgId, tableName: dataTables.tableName })
      .from(dataTables)
      .where(eq(dataTables.kind, 'object')),
  );

  let removed = 0;

  const orgs = [...new Set(tables.map((table) => table.orgId))];

  await inOrder(orgs, (orgId) =>
    withOrg(orgId, (tx) =>
      inOrder(
        tables.filter((table) => table.orgId === orgId),
        async ({ tableName }) => {
          const result = await tx.execute(
            sql`delete from ${sql.identifier(schemaOf(orgId))}.${sql.identifier(tableName)}
            where deleted_at < now() - make_interval(days => ${KEPT_DAYS})`,
          );

          removed += result.rowCount ?? 0;
        },
      ),
    ),
  );

  return removed;
};
