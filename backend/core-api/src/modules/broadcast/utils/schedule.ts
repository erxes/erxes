import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { nextOccurrence, TBroadcastRecurrence } from './recurrence';
import { addBroadcastWorkerQueue, BROADCAST_QUEUES } from './worker';

const QUEUE = BROADCAST_QUEUES.SCHEDULING;

type TSchedule = TBroadcastRecurrence & { dateTime?: Date | string | null };
type TSchedulable = { scheduleDate?: TSchedule | null };
type TScheduled = TSchedulable & { _id: string };

/** A campaign that repeats, rather than one waiting for a single moment. */
export const isRecurring = (campaign?: TSchedulable | null) =>
  !!campaign?.scheduleDate?.every;

/** When a one-shot campaign is set to go out, if one is set at all. */
export const scheduledAt = (
  campaign?: TSchedulable | null,
): Date | undefined => {
  if (isRecurring(campaign)) {
    return undefined;
  }

  const at = campaign?.scheduleDate?.dateTime;

  return at ? new Date(at) : undefined;
};

/**
 * The next moment this campaign is due, of either kind.
 *
 * A repeating campaign works its next moment out from the pattern; a one-shot
 * one has only the moment it was given, and only while it is still ahead.
 */
export const nextFireAt = (
  campaign?: TSchedulable | null,
  after: Date = new Date(),
): Date | undefined => {
  const schedule = campaign?.scheduleDate;

  if (!schedule) {
    return undefined;
  }

  if (schedule.every) {
    return nextOccurrence(schedule, after);
  }

  const at = schedule.dateTime ? new Date(schedule.dateTime) : undefined;

  return at && at.getTime() > after.getTime() ? at : undefined;
};

/**
 * Sets one alarm, for one occurrence.
 *
 * Repeating campaigns are not handed to a repeating job. Each occurrence arms
 * the next when it fires, which means a chain that breaks stops sending rather
 * than one that keeps sending after it should have stopped — the safer of the
 * two ways for a scheduler to fail. The moment is part of the job id, so
 * arming the same occurrence twice is one alarm.
 */
export const armSchedule = async (
  subdomain: string,
  campaign: TScheduled,
  after: Date = new Date(),
): Promise<Date | undefined> => {
  const at = nextFireAt(campaign, after);

  if (!at) {
    return undefined;
  }

  const delay = at.getTime() - Date.now();

  await addBroadcastWorkerQueue({
    // The alarm never waits behind a send: that is the whole point of it.
    queueName: BROADCAST_QUEUES.SCHEDULING,
    data: {
      method: 'schedule',
      payload: {
        subdomain,
        engageMessageId: campaign._id,
        kind: 'start',
        at: at.getTime(),
      },
    },
    jobId: `${campaign._id}_scheduled_${at.getTime()}`,
    delay: delay > 0 ? delay : 0,
  });

  return at;
};

const EVERY =
  Number(process.env.BROADCAST_RECONCILE_MINUTES) > 0
    ? Number(process.env.BROADCAST_RECONCILE_MINUTES)
    : 15;

const armed = new Set<string>();

/**
 * Keeps one slow sweep running per tenant, armed the first time that tenant
 * schedules anything.
 *
 * There is no list of tenants to walk on start-up, so each one registers its
 * own sweep the moment it has something to sweep — the same way segment
 * reconciliation gets itself going.
 */
export const scheduleReconcile = async (subdomain: string) => {
  if (armed.has(subdomain)) {
    return;
  }

  armed.add(subdomain);

  const id = `broadcast-reconcile-${subdomain}`;

  try {
    await sendWorkerQueue('core', QUEUE).upsertJobScheduler(
      id,
      { every: EVERY * 60_000 },
      {
        name: QUEUE,
        data: { method: 'schedule', payload: { subdomain, kind: 'reconcile' } },
        opts: { removeOnComplete: true, removeOnFail: true },
      },
    );
  } catch {
    armed.delete(subdomain);

    return;
  }

  // The sweep used to ride the sending queue. Taken down only once its
  // replacement is running, and a failure here costs nothing worse than the
  // sweep happening twice, which it is built to survive.
  try {
    await sendWorkerQueue('core', BROADCAST_QUEUES.SENDING).removeJobScheduler(
      id,
    );
  } catch {
    // Nothing to undo: the old registration simply stays until it is noticed.
  }
};
