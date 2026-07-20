import type { Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { actionHandlerWorker } from './actionHandlerWorker';
import { triggerHandlerWorker } from './triggerWorker';
import { debugInfo } from '../debugger';
import { aiWorker } from './aiWorker';
import { initScheduleWorker } from './scheduleWorker';

type ICommonJobData = {
  subdomain: string;
};

export interface IJobData<TData> extends ICommonJobData {
  data: TData;
}

const generateMQWorker = (
  redis: Redis,
  queueName: string,
  resolver: (job: Job) => Promise<unknown>,
): Promise<void> => {
  return new Promise((resolve) => {
    createMQWorkerWithListeners(
      'automations',
      queueName,
      resolver,
      redis,
      () => {
        resolve();
      },
    );
  });
};

export const initMQWorkers = async (redis: Redis) => {
  debugInfo('Starting workers...');

  await Promise.all([
    generateMQWorker(redis, 'trigger', triggerHandlerWorker),
    generateMQWorker(redis, 'action', actionHandlerWorker),
    generateMQWorker(redis, 'aiAgent', aiWorker),
    initScheduleWorker(redis),
  ]);

  debugInfo('All workers initialized');
};
