import {
  createMQWorkerWithListeners,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import {
  CHECK_EVERY_MS,
  CUSTOM_DOMAIN_QUEUE,
  isCustomDomainAvailable,
} from '@/customdomain/constants';
import { checkCustomDomains } from '@/customdomain/service';

/**
 * Checks connected domains every ten minutes so they turn active without the
 * tenant pressing Refresh. The repeat key is fixed, so every replica
 * registering it still yields one schedule.
 */
export const startCustomDomainWorker = () => {
  if (!isCustomDomainAvailable()) {
    return;
  }

  createMQWorkerWithListeners(
    'frontline',
    CUSTOM_DOMAIN_QUEUE,
    () => checkCustomDomains(),
    redis,
    () => undefined,
    { concurrency: 1 },
  );

  sendWorkerQueue('frontline', CUSTOM_DOMAIN_QUEUE)
    .add(
      CUSTOM_DOMAIN_QUEUE,
      {},
      {
        repeat: { every: CHECK_EVERY_MS },
        jobId: CUSTOM_DOMAIN_QUEUE,
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
    .catch((e) =>
      console.error('[customdomain] could not schedule checks:', e),
    );
};
