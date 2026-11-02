import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import {
  processScheduledPostJob,
  scheduledPostsDispatcher,
} from '~/worker/scheduledPosts';

type TRedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

/**
 * Registers delayed post workers and the 15-minute reconciliation scheduler.
 */
export const initMQWorkers = async (redis: TRedisConnection) => {
  const scheduledPostsQueue = new Queue('content-scheduled-posts-check', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  await scheduledPostsQueue.upsertJobScheduler(
    'content-scheduled-posts-check',
    {
      pattern: '*/15 * * * *',
      tz: 'UTC',
    },
    {
      name: 'content-scheduled-posts-check',
    },
  );

  createMQWorkerWithListeners(
    'content',
    'scheduled-posts-check',
    scheduledPostsDispatcher,
    redis,
    () => undefined,
  );

  createMQWorkerWithListeners(
    'content',
    'schedule',
    processScheduledPostJob,
    redis,
    () => undefined,
  );
};
