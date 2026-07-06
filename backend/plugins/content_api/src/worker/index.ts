import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import {
  processScheduledPosts,
  scheduledPostsDispatcher,
} from '~/worker/scheduledPosts';

export const initMQWorkers = async (redis: any) => {
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
