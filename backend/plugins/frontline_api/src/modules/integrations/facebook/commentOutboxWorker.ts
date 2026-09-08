import {
  drainCommentReply,
  FACEBOOK_COMMENT_OUTBOX_QUEUE,
} from '@/integrations/facebook/commentOutbox';
import { debugError } from '@/integrations/facebook/debuggers';
import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { Job } from 'bullmq';
import { generateModels } from '~/connectionResolvers';

/**
 * Sends the public comment replies the automation queued. One job per reply,
 * already delayed to its slot, so there is nothing to poll.
 */
export const startFacebookCommentOutboxWorker = () =>
  createMQWorkerWithListeners(
    'frontline',
    FACEBOOK_COMMENT_OUTBOX_QUEUE,
    async (job: Job<{ subdomain: string; outboxId: string }>) => {
      const { subdomain, outboxId } = job.data || {};

      if (!subdomain || !outboxId) {
        debugError(`Comment outbox job ${job.id} is missing its target`);
        return;
      }

      const models = await generateModels(subdomain);

      await drainCommentReply(models, subdomain, outboxId);
    },
    redis,
    () => undefined,
  );
