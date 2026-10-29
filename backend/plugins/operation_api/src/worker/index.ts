import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { DISCORD_NOTIFY_QUEUE } from '@/discordIntegration/constants';
import { checkCycle, dailyCheckCycles } from '~/worker/dailyCheckCycles';
import { deliverDiscordNotification } from '~/worker/discordNotifications';

export const initMQWorkers = async (redis: any) => {
  const myQueue = new Queue('operations-daily-cycles-check', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  await myQueue.upsertJobScheduler(
    'operations-daily-cycles-check',
    {
      pattern: '0 * * * *',
      tz: 'UTC',
    },
    {
      name: 'operations-daily-cycles-check',
    },
  );

  createMQWorkerWithListeners(
    'operations',
    'checkCycle',
    checkCycle,
    redis,
    () => {
      console.log('Worker for queue operations-checkCycle is ready');
    },
  );

  createMQWorkerWithListeners(
    'operations',
    'daily-cycles-check',
    dailyCheckCycles,
    redis,
    () => {
      console.log('Worker for queue operations-daily-cycles-check is ready');
    },
  );

  createMQWorkerWithListeners(
    'operations',
    DISCORD_NOTIFY_QUEUE,
    deliverDiscordNotification,
    redis,
    () => {
      console.log(
        `Worker for queue operations-${DISCORD_NOTIFY_QUEUE} is ready`,
      );
    },
  );
};
