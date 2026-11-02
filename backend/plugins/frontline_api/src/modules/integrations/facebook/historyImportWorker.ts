import {
  FACEBOOK_HISTORY_IMPORT_QUEUE,
  importMessengerHistory,
} from '@/integrations/facebook/services/historyImport';
import { debugError } from '@/integrations/facebook/debuggers';
import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { Job } from 'bullmq';
import { generateModels } from '~/connectionResolvers';

export const startFacebookHistoryImportWorker = () =>
  createMQWorkerWithListeners(
    'frontline',
    FACEBOOK_HISTORY_IMPORT_QUEUE,
    async (job: Job<{ subdomain: string; integrationId: string }>) => {
      const { subdomain, integrationId } = job.data || {};

      if (!subdomain || !integrationId) {
        debugError(`History import job ${job.id} is missing its target`);
        return;
      }

      const models = await generateModels(subdomain);

      await importMessengerHistory({ models, subdomain, integrationId });
    },
    redis,
    () => undefined,
    { concurrency: 1 },
  );
