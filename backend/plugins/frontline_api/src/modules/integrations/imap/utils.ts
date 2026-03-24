import * as dotenv from 'dotenv';
import { generateModels } from '~/connectionResolvers';
import { listenIntegration } from './listener';
import { imapListen } from './messageBroker';
import { redlock } from './redlock';

const { NODE_ENV } = process.env;
dotenv.config();

export { toUpper, findAttachmentParts, createImap } from './imapClient';
export { listenIntegration } from './listener';

const startDistributingJobs = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const distributeJob = async () => {
    let lock;

    try {
      lock = await redlock.acquire(
        [`${subdomain}:imap:work_distributor`],
        60000,
      );
    } catch (e) {
      console.log(e);
      return;
    }

    try {
      const integrations = await models.ImapIntegrations.find({
        healthStatus: 'healthy',
      });

      for (const integration of integrations) {
        imapListen({
          subdomain,
          data: {
            _id: integration._id,
          },
        });
      }
    } catch (error) {
      console.error('Job distribution error:', error);
      await lock.unlock();
    } finally {
      if (lock) {
        try {
          await lock.unlock();
        } catch (unlockError) {
          console.error('Lock unlock error:', unlockError);
        }
      }
    }
  };
  if (NODE_ENV === 'production') {
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }

  while (true) {
    try {
      await distributeJob();
      await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
    } catch (error) {
      console.error('distributeWork error', error);
    }
  }
};

export default startDistributingJobs;

export const routeErrorHandling = (fn: any, callback?: any) => {
  return async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('Route error:', error.message);

      if (callback) {
        return callback(res, error, next);
      }

      return next(error);
    }
  };
};

export const listenIntegrationById = async (
  subdomain: string,
  integrationId: string,
) => {
  const models = await generateModels(subdomain);

  const integration = await models.ImapIntegrations.findById(integrationId);

  if (!integration) {
    console.error(`Queue: imap:listen. Integration not found ${integrationId}`);
    return;
  }

  await listenIntegration(subdomain, integration, models);
};
