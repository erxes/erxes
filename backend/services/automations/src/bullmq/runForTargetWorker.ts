import type { Job } from 'bullmq';
import { generateModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { runAutomationForTarget } from '../executions/runAutomationForTarget';
import { TCreatedVia } from 'erxes-api-shared/core-types';
import { IJobData } from './initMQWorkers';

type IRunForTargetData = {
  automationId: string;
  target: Record<string, any>;
  triggerId?: string;
  createdVia?: TCreatedVia;
};

export const runForTargetWorker = async (
  job: Job<IJobData<IRunForTargetData>>,
) => {
  const { subdomain, data } = job?.data ?? {};

  try {
    const models = await generateModels(subdomain);

    await runAutomationForTarget(subdomain, models, data);
  } catch (error: any) {
    // Logged, not rethrown: one target failing must not retry the whole job
    // and re-run the actions that already succeeded.
    debugError(`Error processing job ${job.id}: ${error.message}`);
  }
};
