import type { Job } from 'bullmq';
import { IModels } from '../../connectionResolver';
import { TDeferredActionRef } from '../../executions/completeDeferredAction';
import { runDeferredCoreAction } from '../../executions/runDeferredCoreAction';

export const runDeferredCoreActionWorker = async (
  models: IModels,
  job: Job<{ subdomain: string; data: TDeferredActionRef }>,
) => {
  const { subdomain, data } = job.data;

  return runDeferredCoreAction(subdomain, models, data);
};
