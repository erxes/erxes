import {
  SEGMENT_QUEUES,
  SegmentQueueName,
} from 'erxes-api-shared/core-modules';
import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { segmentError } from './log';
import { segmentHandler, SegmentJobData } from './segmentHandler';

const CONCURRENCY: Record<SegmentQueueName, number> = {
  [SEGMENT_QUEUES.changed]:
    Number(process.env.SEGMENT_CONCURRENCY_CHANGED) || 10,
  [SEGMENT_QUEUES.forget]: Number(process.env.SEGMENT_CONCURRENCY_FORGET) || 5,
  [SEGMENT_QUEUES.rebuild]:
    Number(process.env.SEGMENT_CONCURRENCY_REBUILD) || 1,
  [SEGMENT_QUEUES.reconcile]:
    Number(process.env.SEGMENT_CONCURRENCY_RECONCILE) || 3,
};

const describe = (data: SegmentJobData): string => {
  if (data.kind === 'rebuild') {
    return data.segmentId;
  }

  if (data.kind === 'reconcile') {
    return 'reconcile';
  }

  if (data.kind === 'forget') {
    return data.segmentIds.join(', ');
  }

  return data.contentType;
};

const worker = (name: SegmentQueueName) =>
  new Promise<void>((resolve, reject) => {
    try {
      createMQWorkerWithListeners(
        SEGMENT_QUEUES.service,
        name,
        async ({ data }: { data: SegmentJobData }) => {
          try {
            await segmentHandler(data);
          } catch (error) {
            segmentError(`${describe(data)} failed`, error);
            throw error;
          }
        },
        redis,
        () => {
          resolve();
        },
        { concurrency: CONCURRENCY[name] },
      );
    } catch (error) {
      reject(error);
    }
  });

export const segmentWorker = async () => {
  await Promise.all([
    worker(SEGMENT_QUEUES.changed),
    worker(SEGMENT_QUEUES.forget),
    worker(SEGMENT_QUEUES.rebuild),
    worker(SEGMENT_QUEUES.reconcile),
  ]);
};
