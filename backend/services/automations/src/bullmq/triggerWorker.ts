import type { Job } from 'bullmq';
import { IJobData } from '@/bullmq/initMQWorkers';
import { generateModels } from '@/connectionResolver';
import { debugError, debugInfo } from '@/debugger';
import { checkIsWaitingAction } from '@/executions/checkIsWaitingActionTarget';
import { executeWaitingAction } from '@/executions/executeWaitingAction';
import { receiveTrigger } from '@/executions/receiveTrigger';
import { repeatActionExecution } from '@/executions/repeatActionExecution';

// Type for trigger job data
interface ITriggerData {
  type: string;
  actionType: string;
  targets: unknown[]; // Replace with actual type if known
  recordType?: string;
  repeatOptions?: { executionId: string; actionId: string };
}

// Final job interfaces
type ITriggerJobData = IJobData<ITriggerData>;

export const triggerHandlerWorker = async (job: Job<ITriggerJobData>) => {
  const { subdomain, data } = job?.data ?? {};
  const models = await generateModels(subdomain);
  debugInfo('Initialized databases');

  debugInfo(`Received data from:${JSON.stringify({ subdomain, data })}`);

  const { type, targets, repeatOptions, recordType } = data;
  try {
    if (repeatOptions) {
      repeatActionExecution(subdomain, models, repeatOptions);
    }

    const waitingAction = await checkIsWaitingAction(
      subdomain,
      models,
      type,
      targets,
    );
    if (waitingAction) {
      executeWaitingAction(subdomain, models, waitingAction);
    }

    await receiveTrigger({ models, subdomain, type, targets, recordType });
  } catch (error: any) {
    debugError(`Error processing job ${job.id}: ${error.message}`);
    throw error;
  }
};
