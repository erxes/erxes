import { sendWorkerQueue } from 'erxes-api-shared/utils';

// No generateModels here, so the grant model can arm it without a require cycle
export const SUPPORT_ACCESS_QUEUE = 'support-access-end';

export interface ISupportAccessEndJob {
  subdomain: string;
  userId: string;
}

/** Closes the support user's access when the grant ends. */
export const armSupportAccessEnd = async (
  subdomain: string,
  grant: { _id: string; userId: string; endsAt?: Date },
) => {
  if (!grant.endsAt) {
    return;
  }

  const job: ISupportAccessEndJob = { subdomain, userId: grant.userId };

  await sendWorkerQueue('core', SUPPORT_ACCESS_QUEUE).add('end', job, {
    delay: Math.max(grant.endsAt.getTime() - Date.now(), 0),
    jobId: `support-access-end-${subdomain}-${grant._id}`,
    removeOnComplete: 100,
    removeOnFail: 100,
  });
};
