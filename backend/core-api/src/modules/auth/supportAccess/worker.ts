import { Job } from 'bullmq';
import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  ISupportAccessEndJob,
  SUPPORT_ACCESS_QUEUE,
} from '@/auth/supportAccess/queue';

let started = false;

const endProcessor = async (job: Job<ISupportAccessEndJob>) => {
  const models = await generateModels(job.data.subdomain);

  return models.SupportGrants.endAccess(job.data.userId);
};

export const startSupportAccessWorker = () => {
  if (started) {
    return;
  }

  started = true;

  createMQWorkerWithListeners(
    'core',
    SUPPORT_ACCESS_QUEUE,
    endProcessor,
    redis,
    () => {
      console.log(`Worker for queue ${SUPPORT_ACCESS_QUEUE} is ready`);
    },
  );
};
