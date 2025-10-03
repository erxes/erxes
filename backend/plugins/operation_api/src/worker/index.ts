import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { dailyCheckCycles } from '~/worker/dailyCheckCycles';

export const initMQWorkers = async (redis: any) => {
  const myQueue = new Queue('operations-daily-cycles-end', {
    connection: redis,
  });

  await myQueue.upsertJobScheduler(
    'operations-daily-cycles-end',
    {
      pattern: '0 0 * * *',
      tz: 'UTC',
    },
    {
      name: 'operations-daily-cycles-end',
    },
  );

  return createMQWorkerWithListeners(
    'operations',
    'daily-cycles-end',
    dailyCheckCycles,
    redis,
    () => {
      console.log('Worker for queue operations-daily-cycles-end is ready');
    },
  );
};
