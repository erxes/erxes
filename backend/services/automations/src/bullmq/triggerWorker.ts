import { handleTrigger } from '@/executions/handleTrigger';
import type { Job } from 'bullmq';
import { debugError } from '../debugger';
import { IJobData } from './initMQWorkers';

// Type for trigger job data
interface ITriggerData {
  type: string;
  actionType: string;
  targets: unknown[]; // Replace with actual type if known
  recordType?: string;
  eventUpdateDescription?: Record<string, any>;
  repeatOptions?: {
    executionId: string;
    actionId: string;
    optionalConnectId?: string;
  };
}

// Final job interfaces
type ITriggerJobData = IJobData<ITriggerData>;

export const triggerHandlerWorker = async (job: Job<ITriggerJobData>) => {
  const { subdomain, data } = job?.data ?? {};


  const { type, targets, repeatOptions, recordType, eventUpdateDescription } =
    data;
  try {
    if (repeatOptions) {
      repeatActionExecution(subdomain, models, repeatOptions);
    } else {
      const waitingAction = await checkIsWaitingAction(
        subdomain,
        models,
        type,
        targets,
      );
      if (waitingAction) {
        executeWaitingAction(subdomain, models, waitingAction);
      }
    }

    await receiveTrigger({
      models,
      subdomain,
      type,
      targets,
      recordType,
      eventUpdateDescription,
    });
  } catch (error: any) {
    debugError(`Error processing job ${job.id}: ${error.message}`);
  }
};
