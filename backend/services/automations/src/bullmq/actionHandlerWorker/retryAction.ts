import type { Job } from 'bullmq';
import { IModels } from '../../connectionResolver';
import { retryAction, TActionRetryRef } from '../../executions/retryAction';

export const retryActionWorker = async (
  models: IModels,
  job: Job<{ subdomain: string; data: TActionRetryRef }>,
) => {
  const { subdomain, data } = job.data;

  return retryAction(subdomain, models, data);
};
