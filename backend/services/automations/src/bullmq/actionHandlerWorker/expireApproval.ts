import type { Job } from 'bullmq';
import { IModels } from '../../connectionResolver';
import { resolveApprovalAction } from '../../executions/resolveApprovalAction';

/** The approval step's clock ran out; a decided step ignores this. */
export const expireApprovalWorker = async (
  models: IModels,
  job: Job<{ subdomain: string; data: { executionId: string; actionId: string } }>,
) => {
  const { subdomain, data } = job.data;

  return resolveApprovalAction(subdomain, models, {
    ...data,
    decision: 'expired',
  });
};
