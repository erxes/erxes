import { sendWorkerQueue } from 'erxes-api-shared/utils';

import {
  syncPostScheduleWithQueue,
  TSchedulablePost,
} from '~/worker/postSchedulingPlan';

/**
 * Synchronizes a post's delayed job through the shared Content schedule queue.
 */
export const syncPostSchedule = async ({
  subdomain,
  previousPost,
  currentPost,
}: {
  subdomain: string;
  previousPost?: TSchedulablePost | null;
  currentPost?: TSchedulablePost | null;
}) =>
  syncPostScheduleWithQueue({
    subdomain,
    previousPost,
    currentPost,
    queue: sendWorkerQueue('content', 'schedule'),
  });

/**
 * Preserves post writes when Redis is unavailable; reconciliation repairs them.
 */
export const syncPostScheduleSafely = async (
  options: Parameters<typeof syncPostSchedule>[0],
) => {
  try {
    await syncPostSchedule(options);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown queue error';

    console.error(
      `[content:schedule] Failed to synchronize post job: ${message}`,
    );
  }
};
