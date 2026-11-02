import { Job } from 'bullmq';
import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  attemptWebhookDelivery,
  IWebhookDelivery,
  WEBHOOK_ATTEMPTS,
  WEBHOOK_QUEUE,
} from '@/data-extensions/changes';

const deliver = async (job: Job<IWebhookDelivery>) => {
  const models = await generateModels(job.data.subdomain);

  await attemptWebhookDelivery(models, job.data, {
    isLastAttempt:
      job.attemptsMade + 1 >= (job.opts.attempts || WEBHOOK_ATTEMPTS),
  });
};

export const initMQWorkers = () =>
  new Promise<void>((resolve) => {
    createMQWorkerWithListeners(
      WEBHOOK_QUEUE.service,
      WEBHOOK_QUEUE.name,
      deliver,
      redis,
      resolve,
      { concurrency: 10 },
    );
  });
