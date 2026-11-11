import { db } from '@erxes/core-db';
import { config } from '~/config';
import { pruneAudit } from '~/modules/audit/audit.service';
import { pruneUploads } from '~/modules/files/files.service';
import { pruneNotifications } from '~/modules/notifications/notifications.service';

const HOUR = 60 * 60 * 1000;

/**
 * Housekeeping, hourly: unfinished uploads, old audit entries and old read
 * notifications. Each step is a plain idempotent DELETE, so running it on
 * every replica at once is harmless.
 */
export const startMaintenance = () => {
  const run = async () => {
    try {
      const uploads = await pruneUploads(db(), config.files.pendingTtlHours);
      const audit = await pruneAudit(db(), config.retention.auditDays);
      const read = await pruneNotifications(db(), config.retention.readNotificationDays);

      if (uploads || audit || read) {
        console.log(`[core] cleanup: ${uploads} unfinished uploads, ${audit} audit entries, ${read} notifications`);
      }
    } catch (error) {
      console.error('[core] cleanup failed', error);
    }
  };

  const first = setTimeout(run, 60_000);
  const timer = setInterval(run, HOUR);

  first.unref();
  timer.unref();

  return () => {
    clearTimeout(first);
    clearInterval(timer);
  };
};
