import { Queue } from 'bullmq';
import { redis } from 'erxes-api-shared/utils';

const CLEANUP_BATCH_SIZE = 1_000;

type TFinishedJobState = 'completed' | 'failed';

const cleanupState = async (
  queue: Queue<unknown>,
  state: TFinishedJobState,
): Promise<number> => {
  let cleanedCount = 0;
  let cleanedJobIds: string[];

  do {
    cleanedJobIds = await queue.clean(0, CLEANUP_BATCH_SIZE, state);
    cleanedCount += cleanedJobIds.length;
  } while (cleanedJobIds.length === CLEANUP_BATCH_SIZE);

  return cleanedCount;
};

/**
 * Removes legacy completed and failed jobs retained before cleanup was enabled.
 */
export const cleanupScheduledPostJobs = async () => {
  const queue = new Queue<unknown>('content-schedule', { connection: redis });

  try {
    const completedCount = await cleanupState(queue, 'completed');
    const failedCount = await cleanupState(queue, 'failed');

    console.log(
      `Removed ${completedCount} completed and ${failedCount} failed content schedule jobs`,
    );
  } finally {
    await queue.close();
    await redis.quit();
  }
};

cleanupScheduledPostJobs().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';

  console.error(`Scheduled-post job cleanup failed: ${message}`);
  process.exitCode = 1;
});
