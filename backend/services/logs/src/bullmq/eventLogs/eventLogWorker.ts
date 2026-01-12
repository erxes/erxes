import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { eventLogHandler } from './eventLogHandler';

export const eventLogWorker = async () => {
  console.info('Starting worker log ...');

  console.info('Initialized databases');
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'logs',
        'put_log',
        async ({ id, data }) => eventLogHandler(id, data),
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
