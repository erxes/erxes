import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { mainScheduler, runner } from '~/worker/hourlyRunner';

type TRedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

export const initMQWorkers = async (redis: TRedisConnection) => {
  const schedulerQueue = new Queue('posclient-hourly-sync-remainder', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  await schedulerQueue.upsertJobScheduler(
    'posclient-hourly-sync-remainder',
    {
      pattern: '0 * * * *',
      tz: 'UTC',
    },
    {
      name: 'posclient-hourly-sync-remainder',
    },
  );

  createMQWorkerWithListeners(
    'posclient',
    'sync-remainder',
    runner,
    redis,
    () => {
      console.log('Worker for queue posclient-sync-remainder is ready');
    },
  );

  createMQWorkerWithListeners(
    'posclient',
    'hourly-sync-remainder',
    mainScheduler,
    redis,
    () => {
      console.log('Worker for queue posclient is ready');
    },
  );
};
