import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { segmentError } from './log';
import { segmentHandler, SegmentJobData } from './segmentHandler';

/**
 * Recomputes segment membership off the write path.
 *
 * Kept here rather than in the services that own the data so a slow or failing
 * recomputation never reaches a user: the queue holds the work, and it is done
 * whenever this worker is up.
 */
export const segmentWorker = async () =>
  new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        'logs',
        'segment',
        async ({ data }: { data: SegmentJobData }) => {
          try {
            await segmentHandler(data);
          } catch (error) {
            // Named before it is rethrown, so the retry is traceable to the
            // job that caused it rather than to a bare queue failure.
            segmentError(
              `${
                data.kind === 'rebuild' ? data.segmentId : data.contentType
              } failed`,
              error,
            );
            throw error;
          }
        },
        redis,
        () => {
          resolve();
        },
      );
    } catch (error) {
      reject(error);
    }
  });
