import type { Job } from 'bullmq';
import { IModels } from '../../connectionResolver';
import {
  expireDeferredAction,
  TDeferredActionRef,
} from '../../executions/completeDeferredAction';

export const expireDeferredActionWorker = async (
  models: IModels,
  job: Job<{ subdomain: string; data: TDeferredActionRef }>,
) => {
  const { subdomain, data } = job.data;

  return expireDeferredAction(subdomain, models, data);
};
