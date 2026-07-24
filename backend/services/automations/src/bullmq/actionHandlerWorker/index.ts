import type { Job } from 'bullmq';
import { executePrevActionWorker } from './executePrevAction';
import { playWaitingActionWorker } from './playWait';
import { setActionWaitHandler } from './setWait';
import {
  resumeParentExecutionWorker,
  startWorkflowWorker,
} from './workflow';
import { generateModels, IModels } from '../../connectionResolver';

type ActionName =
  | 'play'
  | 'wait'
  | 'executePrevAction'
  | 'startWorkflow'
  | 'resumeParentExecution';

export const actionHandlerWorkers: Record<
  ActionName,
  (models: IModels, job: Job) => Promise<any>
> = {
  play: playWaitingActionWorker,
  wait: setActionWaitHandler,
  executePrevAction: executePrevActionWorker,
  startWorkflow: startWorkflowWorker,
  resumeParentExecution: resumeParentExecutionWorker,
};

export const actionHandlerWorker = async (job: Job) => {
  const name = job.name as ActionName;
  const { subdomain } = job.data || {};

  const models = await generateModels(subdomain);

  const handler = actionHandlerWorkers[name];

  if (!handler) {
    throw new Error(`No handler found for job name: ${name}`);
  }

  return handler(models, job);
};
