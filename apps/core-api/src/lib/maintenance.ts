import { db } from '@erxes/core-db';
import { config } from '~/config';
import { pruneAudit } from '~/modules/audit/audit.service';
import { signAuditCheckpoints } from '~/modules/audit/checkpoints';
import { pruneEvents } from '~/modules/events/events.service';
import { CONSUMERS } from '~/modules/events/processor';
import { pruneUploads } from '~/modules/files/files.service';
import { pruneNotifications } from '~/modules/notifications/notifications.service';

const HOUR = 60 * 60 * 1000;

/**
 * Housekeeping, hourly: unfinished uploads, old audit entries, old read
 * notifications and handled events; audit checkpoints every 10 minutes. Each step is a plain idempotent DELETE, so running it on
 * every replica at once is harmless.
 */
export const startMaintenance = () => {
  const run = async () => {
    try {
      const uploads = await pruneUploads(db(), config.files.pendingTtlHours);
      const audit = await pruneAudit(db(), config.retention.auditDays);
      const read = await pruneNotifications(db(), config.retention.readNotificationDays);
      const handled = await pruneEvents(
        db(),
        config.retention.eventDays,
        CONSUMERS.map((consumer) => consumer.name),
      );

      if (uploads || audit || read || handled) {
        console.log(
          `[core] cleanup: ${uploads} unfinished uploads, ${audit} audit entries, ${read} notifications, ${handled} events`,
        );
      }
    } catch (error) {
      console.error('[core] cleanup failed', error);
    }
  };

  // Signed audit checkpoints every 10 minutes: tampering is caught back to the last one.
  const checkpoint = () =>
    signAuditCheckpoints(db()).catch((error: unknown) =>
      console.error('[core] audit checkpoints failed', error),
    );

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
  };
};
