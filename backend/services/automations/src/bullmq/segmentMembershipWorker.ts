import type { Job } from 'bullmq';
import { TAutomationSegmentMembershipJob } from 'erxes-api-shared/core-modules';
import { generateModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { receiveSegmentMembership } from '../executions/receiveSegmentMembership';
import { IJobData } from './initMQWorkers';

export const segmentMembershipWorker = async (
  job: Job<IJobData<TAutomationSegmentMembershipJob>>,
) => {
  const { subdomain, data } = job.data;

  try {
    const models = await generateModels(subdomain);

    await receiveSegmentMembership({ models, subdomain, ...data });
  } catch (error) {
    // Logged, not thrown: a retry would start the same runs twice.
    debugError(
      `Segment membership job ${job.id} failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
