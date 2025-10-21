import type { Job } from 'bullmq';
import { executePrevActionWorker } from '@/bullmq/actionHandlerWorker/executePrevAction';
import { playWaitingActionWorker } from '@/bullmq/actionHandlerWorker/playWait';
import { setActionWaitHandler } from '@/bullmq/actionHandlerWorker/setWait';
import { generateModels, IModels } from '@/connectionResolver';
type ActionName = 'play' | 'wait' | 'executePrevAction';

const actionHandlers: Record<
  ActionName,
  (models: IModels, job: Job) => Promise<any>
> = {
  play: playWaitingActionWorker,
  wait: setActionWaitHandler,
  executePrevAction: executePrevActionWorker,
};

export const actionHandlerWorker = async (job: Job) => {
  const name = job.name as ActionName;
  const { subdomain } = job.data || {};

  const models = await generateModels(subdomain);

  const handler = actionHandlers[name];

  if (!handler) {
    throw new Error(`No handler found for job name: ${name}`);
  }

  return handler(models, job);
};
