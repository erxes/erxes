import { Queue } from 'bullmq';

export const initMQWorkers = async (redis: any) => {
  const myQueue = new Queue('loyalty-daily-check', {
    connection: redis,
  });

  await myQueue.upsertJobScheduler(
    'loyalty-daily-check',
    {
      pattern: '0 * * * *',
      tz: 'UTC',
    },
    {
      name: 'loyalty-daily-check',
    },
  );
};
