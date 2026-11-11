import { db } from '@erxes/core-db';
import { config } from '~/config';
import { logger, traced } from '~/logger';
import { pruneAudit } from '~/modules/audit/audit.service';
import { signAuditCheckpoints } from '~/modules/audit/checkpoints';
import { pruneEvents } from '~/modules/events/events.service';
import { CONSUMERS } from '~/modules/events/processor';
import { pruneUploads } from '~/modules/files/files.service';
import { pruneNotifications } from '~/modules/notifications/notifications.service';

const HOUR = 60 * 60 * 1000;

const log = logger.child({ component: 'maintenance' });

/**
 * Housekeeping, hourly: unfinished uploads, old audit entries, old read
 * notifications and handled events; audit checkpoints every 10 minutes. Each step is a plain idempotent DELETE, so running it on
 * every replica at once is harmless.
 */
const cleanup = () =>
  traced('maintenance cleanup', async () => {
    const uploads = await pruneUploads(db(), config.files.pendingTtlHours, log);
    const audit = await pruneAudit(db(), config.retention.auditDays);
    const read = await pruneNotifications(db(), config.retention.readNotificationDays);

    const handled = await pruneEvents(
      db(),
      config.retention.eventDays,
      CONSUMERS.map((consumer) => consumer.name),
    );

    log.info({ uploads, audit, notifications: read, events: handled }, 'cleanup done');
  }).catch((error: unknown) => log.error({ err: error }, 'cleanup failed'));

// Signed audit checkpoints every 10 minutes: tampering is caught back to the last one.
const checkpoint = () =>
  traced('audit checkpoints', async () => {
    const signed = await signAuditCheckpoints(db());

    if (signed) log.info({ signed }, 'audit checkpoints signed');
  }).catch((error: unknown) => log.error({ err: error }, 'audit checkpoints failed'));

export const startMaintenance = () => {
  const first = setTimeout(() => void cleanup(), 60_000);
  const timer = setInterval(() => void cleanup(), HOUR);
  const checkpoints = setInterval(() => void checkpoint(), 10 * 60 * 1000);

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
