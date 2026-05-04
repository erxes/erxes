import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { mainScheduler, runner } from '~/worker/hourlyRunner';

export const initMQWorkers = async (redis: any) => {
  const myQueue = new Queue('posclient-synch-remainder', {
    connection: redis,
  });

  await myQueue.upsertJobScheduler(
    'posclient-hourly-synch-remainder',
    {
      pattern: '0 * * * *',
      tz: 'UTC',
    },
    {
      name: 'posclient-synch-remainder',
    },
  );

  createMQWorkerWithListeners(
    'posclient',
    'synch-remainder',
    runner,
    redis,
    () => {
      console.log('Worker for queue posclient-synch-remainder is ready');
    },
  );

  createMQWorkerWithListeners(
    'posclient',
    'hourly-synch-remainder',
    mainScheduler,
    redis,
    () => {
      console.log('Worker for queue posclient is ready');
    },
  );
};
