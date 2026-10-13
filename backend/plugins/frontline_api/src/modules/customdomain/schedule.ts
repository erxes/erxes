import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { CHECK_EVERY_MS, CUSTOM_DOMAIN_QUEUE } from '@/customdomain/constants';

const SCHEDULER_ID = 'customdomain-pending-check';

const queue = () => sendWorkerQueue('frontline', CUSTOM_DOMAIN_QUEUE);

/**
 * The 10-minute check only exists while some domain is pending: it is started
 * when a domain is saved or falls back to pending, and removed by the check
 * that finds none left. Upserting an existing scheduler keeps a single one.
 */
export const startPendingChecks = async () => {
  try {
    await queue().upsertJobScheduler(
      SCHEDULER_ID,
      { every: CHECK_EVERY_MS },
      {
        name: CUSTOM_DOMAIN_QUEUE,
        opts: { removeOnComplete: true, removeOnFail: true },
      },
    );
  } catch (e) {
    console.error('[customdomain] could not schedule checks:', e);
  }
};

export const stopPendingChecks = async () => {
  try {
    await queue().removeJobScheduler(SCHEDULER_ID);
  } catch (e) {
    console.error('[customdomain] could not stop checks:', e);
  }
};
