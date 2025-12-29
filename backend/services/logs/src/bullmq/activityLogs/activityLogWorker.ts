import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { activityLogHandler } from './activityLogHandlers';

export const activityLogWorker = async () => {
  console.info('Starting worker log ...');

  console.info('Initialized databases');
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'logs',
        'activity_log',
        async ({ data }) => activityLogHandler(data),
        redis,
        () => {
          resolve();
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};
