import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import {
  CUSTOM_DOMAIN_QUEUE,
  isCustomDomainAvailable,
} from '@/customdomain/constants';
import { startPendingChecks, stopPendingChecks } from '@/customdomain/schedule';
import {
  checkPendingCustomDomains,
  countPendingCustomDomains,
} from '@/customdomain/service';

/**
 * Checks pending domains every ten minutes until they are active. Once none
 * is pending the schedule removes itself, so active domains cost nothing in
 * the background; they are re-checked only when the page is opened.
 */
export const startCustomDomainWorker = async () => {
  if (!isCustomDomainAvailable()) {
    return;
  }

  createMQWorkerWithListeners(
    'frontline',
    CUSTOM_DOMAIN_QUEUE,
    async () => {
      const stillPending = await checkPendingCustomDomains();

      if (stillPending) {
        return;
      }

      await stopPendingChecks();

      // A domain saved while this check ran restarted the schedule just
      // before it was removed; put it back.
      if (await countPendingCustomDomains()) {
        await startPendingChecks();
      }
    },
    redis,
    () => undefined,
    { concurrency: 1 },
  );

  try {
    if (await countPendingCustomDomains()) {
      await startPendingChecks();
    } else {
      await stopPendingChecks();
    }
  } catch (e) {
    console.error('[customdomain] could not read pending domains:', e);
  }
};
