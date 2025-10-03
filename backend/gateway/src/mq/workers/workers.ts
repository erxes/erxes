import { Redis } from 'ioredis';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';

// import { updateApolloRouter } from '~/apollo-router';

export const initMQWorkers = (redis: Redis) => {
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'gateway',
        'update-apollo-router',
        async () => {
          // updateApolloRouter();
          return { result: 'success' };
        },
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
