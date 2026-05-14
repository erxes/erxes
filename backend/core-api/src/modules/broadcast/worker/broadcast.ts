import { Job } from 'bullmq';
import { generateModels } from '~/connectionResolvers';
import { handleEmailProcessor } from './email';
import { handleMessengerProcessor } from './messenger';
import { handleNotificationProcessor } from './notification';

type BroadcastMethod = 'email' | 'messenger' | 'notification';

interface BroadcastJobData {
  method: BroadcastMethod;
  payload: {
    subdomain: string;
    [key: string]: any;
  };
}

const PROCESS_HANDLERS: Record<
  BroadcastMethod,
  (payload: unknown) => Promise<void>
> = {
  email: handleEmailProcessor,
  messenger: handleMessengerProcessor,
  notification: handleNotificationProcessor,
};

export const broadcastProcessor = async (job: Job<BroadcastJobData>) => {
  const { method, payload } = job.data;

  const { subdomain, engageMessage } = payload || {};

  const models = await generateModels(subdomain);

  const handleProcess = PROCESS_HANDLERS[method];

  if (!handleProcess) {
    const error = new Error(`BroadcastProcessor: Unknown method "${method}"`);
    console.error(error);

    await models.EngageMessages.findOneAndUpdate(
      { _id: engageMessage?._id },
      {
        $set: {
          status: 'failed',
        },
      },
    );

    throw error;
  }

  try {
    return await handleProcess(payload);
  } catch (err) {
    console.error(`BroadcastProcessor: Failed processing ${method}`, err);

    await models.EngageMessages.updateOne(
      { _id: engageMessage?._id },
      {
        $set: {
          status: 'failed',
        },
      },
    );

    throw err;
  }
};
