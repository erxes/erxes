import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { Express } from 'express';
import { broadcastProcessor } from './broadcast';

const BROADCAST_QUEUE = 'broadcast_processor';

const startedWorkers = new Set<string>();

export const startBroadcastWorker = async (app: Express) => {
  if (startedWorkers.has(BROADCAST_QUEUE)) {
    return;
  }

  createMQWorkerWithListeners(
    'core',
    BROADCAST_QUEUE,
    broadcastProcessor,
    redis,
    () => {
      console.log(`Worker for queue ${BROADCAST_QUEUE} is ready`);
    },
  );

  startedWorkers.add(BROADCAST_QUEUE);
};
