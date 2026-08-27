import { sendWorkerQueue } from '../../utils/mq-worker';

/**
 * Work for the segmentation worker.
 *
 * Queued rather than acted on: recomputing membership can reach several
 * services, and none of that belongs on the write path a user is waiting for.
 * Redis holds the job, so the work survives the worker being down and is done
 * when it comes back.
 *
 * Best-effort in the same way the log journal is - a change is never rolled
 * back because its follow-up could not be queued. What that costs is a
 * membership that drifts until something touches those records again, which is
 * what a periodic reconciliation is for.
 */
export const SEGMENT_QUEUE = { service: 'logs', name: 'segment' } as const;

/** Records changed, so whoever they can move has to be re-decided. */
export type SegmentChangedEvent = {
  kind?: 'changed';
  subdomain: string;
  /** As the event dispatcher names it, e.g. `sales:sales.deals`. */
  contentType: string;
  docIds: string[];
};

/**
 * A definition changed, so its whole membership is stale.
 *
 * Record-driven work only ever re-decides the records that moved, which cannot
 * notice that the question itself is different now. Without this, an edited
 * segment keeps answering with the old definition indefinitely.
 */
export type SegmentRebuildEvent = {
  kind: 'rebuild';
  subdomain: string;
  segmentId: string;
};

/** A segment is gone; its id has to come off the records still carrying it. */
export type SegmentForgetEvent = {
  kind: 'forget';
  subdomain: string;
  contentType: string;
  segmentIds: string[];
};

export type SegmentJob =
  | SegmentChangedEvent
  | SegmentRebuildEvent
  | SegmentForgetEvent;

const enqueue = (job: SegmentJob): void => {
  try {
    sendWorkerQueue(SEGMENT_QUEUE.service, SEGMENT_QUEUE.name)
      .add(SEGMENT_QUEUE.name, job, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
      })
      .catch(() => {
        /* never surface a follow-up failure to the write path */
      });
  } catch {
    /* never break a write because a queue was unreachable */
  }
};

export const sendSegmentChanged = (
  event: Omit<SegmentChangedEvent, 'kind'>,
): void => {
  if (!event.docIds.length) {
    return;
  }

  enqueue({ ...event, kind: 'changed' });
};

export const sendSegmentRebuild = (
  event: Omit<SegmentRebuildEvent, 'kind'>,
): void => enqueue({ ...event, kind: 'rebuild' });

export const sendSegmentForget = (
  event: Omit<SegmentForgetEvent, 'kind'>,
): void => {
  if (!event.segmentIds.length) {
    return;
  }

  enqueue({ ...event, kind: 'forget' });
};
