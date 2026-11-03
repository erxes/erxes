import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { userActivityHandler } from './userActivityHandler';

export const userActivityWorker = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'logs',
        'user_activity',
        async ({ data }) => userActivityHandler(data),
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
