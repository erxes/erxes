import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { mainScheduler, runner } from '~/worker/hourlyRunner';

export const initMQWorkers = async (redis: any) => {
  const myQueue = new Queue('posclient-sync-remainder', {
    connection: redis,
  });

  await myQueue.upsertJobScheduler(
    'posclient-hourly-sync-remainder',
    {
      pattern: '0 * * * *',
      tz: 'UTC',
    },
    {
      name: 'posclient-sync-remainder',
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
