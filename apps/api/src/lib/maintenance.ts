import { withSystem } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';
import { logger } from '~/logger';
import { pruneAudit } from '~/modules/audit/audit.service';
import { signAuditCheckpoints } from '~/modules/audit/checkpoints';
import { pruneRunDetails } from '~/modules/automations/runs.service';
import { tickAutomations } from '~/modules/automations/triggers';
import { pruneEvents } from '~/modules/events/events.service';
import { pruneUploads, purgeDeletedFiles } from '~/modules/files/files.service';
import { storage } from '~/modules/files/storage';
import { pruneNotifications } from '~/modules/notifications/inbox.service';
import { refreshAllEntitlements } from '~/modules/saas/entitlements';
import { defineSchedule } from '~/modules/jobs/jobs';
import { purgeExpiredTrash } from '~/modules/trash/trash.service';
import { pruneDeliveries } from '~/modules/webhooks/webhookDelivery';

const log = logger.child({ component: 'maintenance' });

const HOUR = 60 * 60 * 1000;

/**
 * Unfinished uploads, old audit entries, read notifications, webhook
 * deliveries and old events, the recycle bin and SaaS entitlements. Each
 * step spans organisations (a system scope of its own) and is idempotent.
 */
const cleanup = async () => {
  const uploads = await withSystem('cleanup: uploads', (tx) =>
    pruneUploads(tx, config.files.pendingTtlHours),
  );

  await purgeDeletedFiles();

  await storage().sweepUploads?.(config.files.pendingTtlHours * HOUR);

  const audit = await withSystem('cleanup: audit', (tx) =>
    pruneAudit(tx, config.retention.auditDays),
  );

  const read = await withSystem('cleanup: notifications', (tx) =>
    pruneNotifications(tx, config.retention.readNotificationDays),
  );

  await withSystem('cleanup: webhook deliveries', (tx) =>
    pruneDeliveries(tx, config.retention.eventDays),
  );

  const runs = await withSystem('cleanup: automation run details', (tx) =>
    pruneRunDetails(tx, config.retention.runDetailDays),
  );

  await withSystem('cleanup: recycle bin', (tx) => purgeExpiredTrash(tx));
  // Read-only plugins past their grace period turn off here.
  await refreshAllEntitlements();
  await withSystem('cleanup: deletion counters', (tx) =>
    tx.execute(sql`delete from core_deletion_counters where bucket < now() - interval '1 day'`),
  );

  const handled = await withSystem('cleanup: events', (tx) =>
    pruneEvents(tx, config.retention.eventDays),
  );

  if (uploads || audit || read || handled || runs) {
    log.info(
      { uploads, audit, notifications: read, events: handled, runDetails: runs },
      'cleanup removed old records',
    );
  }
};

/** Core's schedules: one job per occurrence for the whole deployment (pg-boss's cron). */
export const MAINTENANCE = [
  defineSchedule({
    queue: 'maintenance.cleanup',
    cron: '0 * * * *',
    timeoutSeconds: 900,
    run: cleanup,
  }),
  // Deleted files lose their bytes within a minute (retried while storage fails).
  defineSchedule({ queue: 'files.purge', cron: '* * * * *', run: purgeDeletedFiles }),
  // Scheduled and date automations.
  defineSchedule({ queue: 'automations.tick', cron: '* * * * *', run: tickAutomations }),
  // Signed audit checkpoints: tampering is caught back to the last one.
  defineSchedule({
    queue: 'audit.checkpoints',
    cron: '*/10 * * * *',
    run: () => withSystem('audit checkpoints', (tx) => signAuditCheckpoints(tx)),
  }),
];
