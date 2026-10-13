import { sendWorkerQueue } from '../../utils/mq-worker';

const BROADCAST_SCHEDULER_QUEUE = 'broadcast_scheduler';

export type SegmentMaterializedPayload = {
  subdomain: string;
  kind: 'segmentMaterialized';
  segmentId: string;
  materializedAt: number;
};

/** Tells broadcast a segment's nightly materialization is complete. */
export const sendSegmentMaterialized = (
  payload: Omit<SegmentMaterializedPayload, 'kind'>,
) =>
  sendWorkerQueue('core', BROADCAST_SCHEDULER_QUEUE)
    .add(BROADCAST_SCHEDULER_QUEUE, {
      method: 'schedule',
      payload: { ...payload, kind: 'segmentMaterialized' },
    })
    .catch(() => {
      // Best effort: a missed day shows on the campaign as no run.
    });
