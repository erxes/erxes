import type { Job } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { actionHandlerWorker } from '@/bullmq/actionHandlerWorker';
import { triggerHandlerWorker } from '@/bullmq/triggerWorker';
import { debugInfo } from '@/debuuger';
import { aiWorker } from '@/bullmq/aiWorker';

type ICommonJobData = {
  subdomain: string;
};

export interface IJobData<TData> extends ICommonJobData {
  data: TData;
}

const generateMQWorker = (
  redis: any,
  queueName: string,
  resolver: (job: Job) => Promise<any>,
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

export const initMQWorkers = async (redis: any) => {
  debugInfo('Starting workers...');

  await Promise.all([
    generateMQWorker(redis, 'trigger', triggerHandlerWorker),
    generateMQWorker(redis, 'action', actionHandlerWorker),
    generateMQWorker(redis, 'aiAgent', aiWorker),
  ]);

  debugInfo('All workers initialized');
};
