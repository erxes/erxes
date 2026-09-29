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
import { generateModels } from '~/connectionResolvers';

// Nightly per organization: release pending points, expire lots, reset the
// wallets whose period began. Only organizations with such wallets get a run.
const runPeriods = async (job: Job) => {
  const { subdomain } = job.data ?? {};

  if (!subdomain) {
    return;
  }

  const models = await generateModels(subdomain);

  await releasePendingLots({ models, subdomain });
  await expireLots({ models, subdomain });

  const more = await resetDueAccountTypes({
    models,
    subdomain,
    timeZone: await loyaltyTimeZone(subdomain),
  });

  if (more) {
    await continuePeriodRun(subdomain);
    return;
  }

  // Nothing left that moves with time: the organization stops getting runs.
  if (!(await needsPeriodRuns(models))) {
    await syncPeriodSchedule(models, subdomain);
  }
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
