import type { Job } from 'bullmq';
import { IModels } from '../../connectionResolver';
import { resolveWaitEventTimeout } from '../../executions/resolveWaitEvent';

/** The wait event's clock ran out; a run the event resumed ignores this. */
export const expireWaitWorker = async (
  models: IModels,
  job: Job<{ subdomain: string; data: { executionId: string; actionId: string } }>,
) => {
  const { subdomain, data } = job.data;

  return resolveWaitEventTimeout(subdomain, models, data);
};
