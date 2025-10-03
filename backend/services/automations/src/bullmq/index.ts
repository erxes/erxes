import type { Job } from 'bullmq';
import { createMQWorkerWithListeners } from 'erxes-api-shared/utils';
import { actionHandlerWorker } from '@/bullmq/actionWorker';
import { triggerHandlerWorker } from '@/bullmq/triggerWorker';
import { debugInfo } from '@/debuuger';

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
  ]);

  debugInfo('All workers initialized');
};
