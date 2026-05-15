import { Redis } from 'ioredis';
import {
  clearServiceDiscoveryCache,
  createMQWorkerWithListeners,
} from 'erxes-api-shared/utils';
import { restartRouter } from '~/apollo-router';
import { retryGetProxyTargets } from '~/proxy/targets';

export const initMQWorkers = (redis: Redis) => {
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'gateway',
        'update-apollo-router',
        async () => {
          clearServiceDiscoveryCache();
          global.currentTargets = await retryGetProxyTargets();
          await restartRouter(global.currentTargets);
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
