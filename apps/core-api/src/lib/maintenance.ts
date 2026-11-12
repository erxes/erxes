import { withSystem } from '@erxes/core-db';
import { config } from '~/config';
import { pruneAudit } from '~/modules/audit/audit.service';
import { signAuditCheckpoints } from '~/modules/audit/checkpoints';
import { pruneEvents } from '~/modules/events/events.service';
import { CONSUMERS } from '~/modules/events/processor';
import { pruneUploads, purgeDeletedFiles } from '~/modules/files/files.service';
import { storage } from '~/modules/files/storage';
import { pruneDeliveries } from '~/modules/webhooks/webhooks.service';
import { tickAutomations } from '~/modules/automations/triggers';
import { pruneNotifications } from '~/modules/notifications/notifications.service';
import { log } from '~/lib/log';
import { purgeExpiredTrash } from '~/modules/trash/trash.service';
import { sql } from 'drizzle-orm';

const HOUR = 60 * 60 * 1000;

/**
 * Housekeeping, hourly: unfinished uploads, old audit entries, old read
 * notifications and handled events; audit checkpoints every 10 minutes. Each step is a plain idempotent DELETE, so running it on
 * every replica at once is harmless.
 */
export const startMaintenance = () => {
  const run = async () => {
    try {
      // Each step spans organisations: a system scope of its own.
      const uploads = await withSystem('cleanup: uploads', (tx) => pruneUploads(tx, config.files.pendingTtlHours));

      await storage().sweepUploads?.(config.files.pendingTtlHours * HOUR);
      const audit = await withSystem('cleanup: audit', (tx) => pruneAudit(tx, config.retention.auditDays));
      const read = await withSystem('cleanup: notifications', (tx) =>
        pruneNotifications(tx, config.retention.readNotificationDays),
      );
      await withSystem('cleanup: webhook deliveries', (tx) => pruneDeliveries(tx, config.retention.eventDays));
      // The recycle bin keeps things 30 days.
      await withSystem('cleanup: recycle bin', (tx) => purgeExpiredTrash(tx));
      await withSystem('cleanup: deletion counters', (tx) => tx.execute(sql`delete from core_deletion_counters where bucket < now() - interval '1 day'`));
      const handled = await withSystem('cleanup: events', (tx) =>
        pruneEvents(tx, config.retention.eventDays, CONSUMERS.map((consumer) => consumer.name)),
      );

      if (uploads || audit || read || handled) {
        log.info(
          `cleanup: ${uploads} unfinished uploads, ${audit} audit entries, ${read} notifications, ${handled} events`,
        );
      }
    } catch (error) {
      log.error('cleanup failed', { error });
    }
  };

  // Deleted files: their bytes go within a minute (retried while storage fails).
  const purge = () =>
    withSystem('cleanup: deleted files', (tx) => purgeDeletedFiles(tx)).catch((error: unknown) =>
      log.error('purging deleted files failed', { error }),
    );
  const purger = setInterval(purge, 60_000);

  purger.unref();

  // Scheduled and date automations: checked every minute.
  const scheduler = setInterval(
    () => void tickAutomations().catch((error: unknown) => log.error('automation scheduling failed', { error })),
    60_000,
  );

  scheduler.unref();

  // Signed audit checkpoints every 10 minutes: tampering is caught back to the last one.
  const checkpoint = () =>
    withSystem('audit checkpoints', (tx) => signAuditCheckpoints(tx)).catch((error: unknown) => log.error('audit checkpoints failed', { error }));

  const first = setTimeout(run, 60_000);
  const timer = setInterval(run, HOUR);
  const checkpoints = setInterval(checkpoint, 10 * 60 * 1000);

  first.unref();
  timer.unref();
  checkpoints.unref();
  void checkpoint();

  return () => {
    clearTimeout(first);
    clearInterval(timer);
    clearInterval(checkpoints);
    clearInterval(purger);
    clearInterval(scheduler);
  };
};
