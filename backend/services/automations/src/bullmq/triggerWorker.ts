import type { Job } from 'bullmq';
import { IJobData } from '@/bullmq/initMQWorkers';
import { generateModels } from '@/connectionResolver';
import { debugError, debugInfo } from '@/debuuger';
import { checkIsWaitingAction } from '@/executions/checkIsWaitingActionTarget';
import { executeWaitingAction } from '@/executions/executeWaitingAction';
import { receiveTrigger } from '@/executions/recieveTrigger';

// Type for trigger job data
interface ITriggerData {
  type: string;
  actionType: string;
  targets: unknown[]; // Replace with actual type if known
  executionId: string;
}

// Final job interfaces
type ITriggerJobData = IJobData<ITriggerData>;

export const triggerHandlerWorker = async (job: Job<ITriggerJobData>) => {
  const { subdomain, data } = job?.data ?? {};
  const models = await generateModels(subdomain);
  debugInfo('Initialized databases');

  debugInfo(`Recieved data from:${JSON.stringify({ subdomain, data })}`);

  const { type, targets, executionId } = data;
  try {
    const waitingAction = await checkIsWaitingAction(
      models,
      type,
      targets,
      executionId,
    );

    if (waitingAction) {
      executeWaitingAction(subdomain, models, waitingAction);
      return;
    }

    await receiveTrigger({ models, subdomain, type, targets });
  } catch (error: any) {
    debugError(`Error processing job ${job.id}: ${error.message}`);
    throw error;
  }
};
