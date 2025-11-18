import type { Job } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { systemLogWorker } from './systemLogWorker';
import { activityLogWorker } from './activityLogWorker';

const generateMQWorker = (
  redis: any,
  queueName: string,
  resolver: (job: Job<any>) => Promise<any>,
): Promise<void> => {
  return new Promise((resolve) => {
    createMQWorkerWithListeners('logs', queueName, resolver, redis, () => {
      resolve();
    });
  });
};

export const initMQWorkers = async (redis: any) => {
  console.info('Starting worker log ...');

  console.info('Initialized databases');
  await Promise.all([
    generateMQWorker(redis, 'put_log', systemLogWorker),
    generateMQWorker(redis, 'activity_log', activityLogWorker),
  ]);
};
