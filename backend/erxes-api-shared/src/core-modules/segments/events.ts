import { sendWorkerQueue } from '../../utils/mq-worker';

export const SEGMENT_QUEUES = {
  service: 'logs',
  changed: 'segment-changed',
  forget: 'segment-forget',
  rebuild: 'segment-rebuild',
  reconcile: 'segment-reconcile',
} as const;

export type SegmentQueueName = (typeof SEGMENT_QUEUES)[Exclude<
  keyof typeof SEGMENT_QUEUES,
  'service'
>];

export const segmentQueueFor = (job: SegmentJob): SegmentQueueName =>
  SEGMENT_QUEUES[job.kind || 'changed'];

export type SegmentChangedEvent = {
  kind?: 'changed';
  subdomain: string;
  contentType: string;
  docIds: string[];
  segmentIds?: string[];
  changed?: Record<string, { prev?: unknown; next?: unknown }>;
};

export type SegmentRebuildEvent = {
  kind: 'rebuild';
  subdomain: string;
  segmentId: string;
};

export type SegmentReconcileEvent = {
  kind: 'reconcile';
  subdomain: string;
  before?: string;
  step?: number;
};

export type SegmentForgetEvent = {
  kind: 'forget';
  subdomain: string;
  contentType: string;
  segmentIds: string[];
};

export type SegmentJob =
  | SegmentChangedEvent
  | SegmentRebuildEvent
  | SegmentForgetEvent
  | SegmentReconcileEvent;

const RECONCILE_CRON = process.env.SEGMENT_RECONCILE_CRON || '0 3 * * *';
const RECONCILE_TZ = process.env.SEGMENT_RECONCILE_TZ;

const reconcileScheduled = new Set<string>();

export const scheduleSegmentReconcile = (subdomain: string): void => {
  if (reconcileScheduled.has(subdomain)) {
    return;
  }

  reconcileScheduled.add(subdomain);

  try {
    sendWorkerQueue(SEGMENT_QUEUES.service, SEGMENT_QUEUES.reconcile)
      .add(
        SEGMENT_QUEUES.reconcile,
        { kind: 'reconcile', subdomain } as SegmentReconcileEvent,
        {
          repeat: {
            pattern: RECONCILE_CRON,
            ...(RECONCILE_TZ ? { tz: RECONCILE_TZ } : {}),
          },
          jobId: `segment-reconcile-${subdomain}`,
          removeOnComplete: true,
          removeOnFail: true,
        },
      )
      .catch(() => {
        reconcileScheduled.delete(subdomain);
      });
  } catch {
    reconcileScheduled.delete(subdomain);
  }
};

const attemptsFor = (job: SegmentJob): number =>
  job.kind === 'rebuild' || job.kind === 'reconcile' ? 1 : 3;

const enqueue = (job: SegmentJob): void => {
  scheduleSegmentReconcile(job.subdomain);

  try {
    const name = segmentQueueFor(job);

    sendWorkerQueue(SEGMENT_QUEUES.service, name)
      .add(name, job, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: attemptsFor(job),
      })
      .catch(() => {
        // Best effort: a write is never rolled back because its follow-up
        // could not be queued. Reconciliation catches what drifts.
      });
  } catch {
    // As above - the queue being unreachable must not fail the write.
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

export const sendSegmentReconcile = (
  event: Omit<SegmentReconcileEvent, 'kind'>,
): void => enqueue({ ...event, kind: 'reconcile' });

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
