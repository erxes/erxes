import { Redis } from 'ioredis';
import {
  clearServiceDiscoveryCache,
  createMQWorkerWithListeners,
} from 'erxes-api-shared/utils';
import { restartRouter } from '~/apollo-router';
import { retryGetProxyTargets } from '~/proxy/targets';

let routerUpdateInFlight: Promise<void> | undefined;

const updateApolloRouter = async () => {
  if (routerUpdateInFlight) {
    await routerUpdateInFlight;
    return;
  }

  routerUpdateInFlight = (async () => {
    clearServiceDiscoveryCache();
    global.currentTargets = await retryGetProxyTargets();
    await restartRouter(global.currentTargets);
  })();

  try {
    await routerUpdateInFlight;
  } finally {
    routerUpdateInFlight = undefined;
  }
};

export const initMQWorkers = (redis: Redis) => {
  return new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'gateway',
        'update-apollo-router',
        async () => {
          await updateApolloRouter();
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
