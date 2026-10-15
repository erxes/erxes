import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { mainScheduler, runner } from '~/worker/hourlyRunner';

type TRedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

export const initMQWorkers = async (redis: TRedisConnection) => {
  const remainderQueue = new Queue('posclient-sync-remainder', {
    connection: redis,
  });
  const schedulerQueue = new Queue('posclient-hourly-sync-remainder', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  try {
    // The old scheduler sent jobs without tenant data directly to the runner.
    await remainderQueue.removeJobScheduler('posclient-hourly-sync-remainder');

    for (const queue of [remainderQueue, schedulerQueue]) {
      let removed: string[];
      do {
        removed = await queue.clean(0, 1000, 'failed');
      } while (removed.length === 1000);
    }

    await schedulerQueue.upsertJobScheduler(
      'posclient-hourly-sync-remainder',
      {
        pattern: '0 20 * * *',
        tz: 'UTC',
      },
      {
        name: 'posclient-hourly-sync-remainder',
        opts: {
          removeOnComplete: true,
          removeOnFail: true,
        },
      },
    );
  } finally {
    await remainderQueue.close();
    await schedulerQueue.close();
  }

  createMQWorkerWithListeners(
    'posclient',
    'sync-remainder',
    runner,
    redis,
    () => {},
  );

  createMQWorkerWithListeners(
    'posclient',
    'hourly-sync-remainder',
    mainScheduler,
    redis,
    () => {},
  );
};
