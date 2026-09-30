import { Job, Queue } from 'bullmq';
import { createMQWorkerWithListeners, getEnv } from 'erxes-api-shared/utils';
import type { Redis } from 'ioredis';
import { resetDueAccountTypes } from '@/score/services/accountReset';
import { expireLots, releasePendingLots } from '@/score/services/lotJobs';
import {
  continuePeriodRun,
  loyaltyTimeZone,
  needsPeriodRuns,
  PERIODS_QUEUE,
  syncPeriodSchedule,
} from '@/score/services/periodSchedule';
import { generateModels, IModels } from '~/connectionResolvers';

// A period run of one organization: release pending points, expire lots,
// reset the wallets whose period began. A run that stops at its batch limit
// continues as another job and is recorded as the same run.
const runPeriods = async (job: Job) => {
  const { subdomain, runId: continuing } = job.data ?? {};

  if (!subdomain) {
    return;
  }

  const models = await generateModels(subdomain);
  const runId: string =
    continuing || (await models.LoyaltyPeriodRuns.startRun())._id;

  try {
    // Lots move in the first batch only; later batches carry on resetting.
    const lots = continuing
      ? { released: 0, expired: 0, failed: 0 }
      : await moveLots(models, subdomain, runId);
    const reset = await resetDueAccountTypes({
      models,
      subdomain,
      timeZone: await loyaltyTimeZone(subdomain),
      runId,
    });

    await models.LoyaltyPeriodRuns.addBatch(
      runId,
      {
        released: lots.released,
        expired: lots.expired,
        reset: reset.reset,
        failed: lots.failed + reset.failed,
      },
      !reset.more,
    );

    if (reset.more) {
      await continuePeriodRun(subdomain, runId);
      return;
    }
  } catch (error) {
    await models.LoyaltyPeriodRuns.failRun(
      runId,
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }

  // Nothing left that moves with time: the organization stops getting runs.
  if (!(await needsPeriodRuns(models))) {
    await syncPeriodSchedule(models, subdomain);
  }
};

const moveLots = async (models: IModels, subdomain: string, runId: string) => {
  const released = await releasePendingLots({ models, subdomain });
  const expired = await expireLots({ models, subdomain, runId });

  return {
    released: released.released,
    expired: expired.expired,
    failed: released.failed + expired.failed,
  };
};

// The hourly run for every organization that this replaced.
const removeHourlyRun = async (redis: Redis) => {
  const queue = new Queue('loyalty-daily-check', { connection: redis });

  await queue.removeJobScheduler('loyalty-daily-check');
  await queue.close();
};

export const initMQWorkers = async (redis: Redis) => {
  await removeHourlyRun(redis).catch((error) =>
    console.error(`[loyalty periods] remove hourly run: ${error?.message}`),
  );

  // A single-organization install has wallets from before runs were kept per
  // organization; SaaS organizations get theirs when a wallet is saved.
  if (getEnv({ name: 'VERSION' }) !== 'saas') {
    await syncPeriodSchedule(await generateModels('os'), 'os').catch((error) =>
      console.error(`[loyalty periods] os schedule: ${error?.message}`),
    );
  }

  createMQWorkerWithListeners(
    'loyalty',
    PERIODS_QUEUE,
    runPeriods,
    redis,
    () => undefined,
  );
};
