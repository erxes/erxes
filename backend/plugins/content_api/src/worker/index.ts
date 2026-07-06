import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import {
  processScheduledPosts,
  scheduledPostsDispatcher,
} from '~/worker/scheduledPosts';

type TRedisConnection = Parameters<typeof createMQWorkerWithListeners>[3];

/**
 * Registers the CMS background workers: a repeatable per-minute scheduler
 * job that dispatches scheduled-post checks, and the per-organization worker
 * that publishes/archives the due posts.
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
      pattern: '* * * * *',
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
    () => {
      console.log('Worker for queue content-scheduled-posts-check is ready');
    },
  );

  createMQWorkerWithListeners(
    'content',
    'schedule',
    processScheduledPosts,
    redis,
    () => {
      console.log('Worker for queue content-schedule is ready');
    },
  );
};
