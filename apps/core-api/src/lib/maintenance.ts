import { withSystem } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { config } from '~/config';
import { log } from '~/lib/log';
import { pruneAudit } from '~/modules/audit/audit.service';
import { signAuditCheckpoints } from '~/modules/audit/checkpoints';
import { tickAutomations } from '~/modules/automations/triggers';
import { pruneEvents } from '~/modules/events/events.service';
import { CONSUMERS } from '~/modules/events/processor';
import { pruneUploads, purgeDeletedFiles } from '~/modules/files/files.service';
import { storage } from '~/modules/files/storage';
import { pruneNotifications } from '~/modules/notifications/notifications.service';
import { refreshAllEntitlements } from '~/modules/saas/saas.service';
import { purgeExpiredTrash } from '~/modules/trash/trash.service';
import { pruneDeliveries } from '~/modules/webhooks/webhooks.service';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Unfinished uploads, old audit entries, read notifications, webhook
 * deliveries and handled events, the recycle bin and SaaS entitlements. Each
 * step spans organisations (a system scope of its own) and is idempotent, so
 * running it on every replica at once is harmless.
 */
const cleanup = async () => {
  const uploads = await withSystem('cleanup: uploads', (tx) =>
    pruneUploads(tx, config.files.pendingTtlHours),
  );

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
  await withSystem('cleanup: recycle bin', (tx) => purgeExpiredTrash(tx));
  // Read-only plugins past their grace period turn off here.
  await refreshAllEntitlements();
  await withSystem('cleanup: deletion counters', (tx) =>
    tx.execute(sql`delete from core_deletion_counters where bucket < now() - interval '1 day'`),
  );

  const handled = await withSystem('cleanup: events', (tx) =>
    pruneEvents(
      tx,
      config.retention.eventDays,
      CONSUMERS.map((consumer) => consumer.name),
    ),
  );

  if (uploads || audit || read || handled) {
    log.info(
      `cleanup: ${uploads} unfinished uploads, ${audit} audit entries, ${read} notifications, ${handled} events`,
    );
  }
};

/** Runs `job` and logs a failure; the next run tries again. */
const attempt = (what: string, job: () => Promise<unknown>) => () => {
  job().catch((error: unknown) => log.error(`${what} failed`, { error }));
};

/** Starts the background timers; the returned function stops them. */
export const startMaintenance = () => {
  const signCheckpoints = attempt('audit checkpoints', () =>
    withSystem('audit checkpoints', (tx) => signAuditCheckpoints(tx)),
  );

  const timers = [
    setTimeout(attempt('cleanup', cleanup), MINUTE),
    setInterval(attempt('cleanup', cleanup), HOUR),
    // Deleted files lose their bytes within a minute (retried while storage fails).
    setInterval(
      attempt('purging deleted files', () =>
        withSystem('cleanup: deleted files', (tx) => purgeDeletedFiles(tx)),
      ),
      MINUTE,
    ),
    // Scheduled and date automations.
    setInterval(attempt('automation scheduling', tickAutomations), MINUTE),
    // Signed audit checkpoints: tampering is caught back to the last one.
    setInterval(signCheckpoints, 10 * MINUTE),
  ];

  for (const timer of timers) timer.unref();

  signCheckpoints();

  return () => {
    for (const timer of timers) clearTimeout(timer);
  };
};
