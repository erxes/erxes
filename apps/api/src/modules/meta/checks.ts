import { metaConnections, withSystem } from '@erxes/core-db';
import { asc } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { defineSchedule } from '~/modules/jobs/jobs';
import { repairConnection } from './connections.service';
import { pruneSends } from './send';

const log = logger.child({ component: 'meta' });

const SEND_KEEP_DAYS = 7;

const checkAll = async () => {
  const all = await withSystem('meta daily check', (tx) =>
    tx
      .select({ orgId: metaConnections.orgId, id: metaConnections.id })
      .from(metaConnections)
      .orderBy(asc(metaConnections.orgId), asc(metaConnections.id)),
  );

  await inOrder(all, (row) =>
    repairConnection(row.orgId, row.id, { daily: true }).catch((error: unknown) => {
      log.error({ err: error, orgId: row.orgId, connectionId: row.id }, 'Meta check failed');
    }),
  );

  await withSystem('meta send keys', (tx) => pruneSends(tx, SEND_KEEP_DAYS));
};

export const metaCheckSchedule = defineSchedule({
  queue: 'meta.check',
  cron: '17 3 * * *',
  timeoutSeconds: 3600,
  run: checkAll,
});
