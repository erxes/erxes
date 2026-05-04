import { Queue } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import {
  scheduleTourDateStatusSync,
  syncTourDateStatus,
} from '~/worker/tourDateStatus';

export const initMQWorkers = async (redis: any) => {
  const schedulerQueue = new Queue('tourism-hourly-tour-date-status-sync', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  await schedulerQueue.upsertJobScheduler(
    'tourism-hourly-tour-date-status-sync',
    {
      pattern: '0 * * * *',
      tz: 'UTC',
    },
    {
      name: 'tourism-hourly-tour-date-status-sync',
    },
  );

  createMQWorkerWithListeners(
    'tourism',
    'tour-date-status-sync',
    syncTourDateStatus,
    redis,
    () => {
      console.log('Worker for queue tourism-tour-date-status-sync is ready');
    },
  );

  createMQWorkerWithListeners(
    'tourism',
    'hourly-tour-date-status-sync',
    scheduleTourDateStatusSync,
    redis,
    () => {
      console.log(
        'Worker for queue tourism-hourly-tour-date-status-sync is ready',
      );
    },
  );
};
