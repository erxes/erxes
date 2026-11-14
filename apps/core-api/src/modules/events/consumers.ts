import { type Db, events } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { defineJob } from '~/modules/jobs/jobs';
import { EVENT_QUEUE_PREFIX } from './events.service';
import { webhooksConsumer } from '~/modules/webhooks/webhookDelivery';
import { automationsConsumer } from '~/modules/automations/consumer';
import { pluginEventsConsumer } from '~/modules/plugins/pluginEvents';
import { notificationsConsumer, timelineConsumer } from './coreConsumers';

type EventRow = typeof events.$inferSelect;

/** A consumer turns events into something; it must be idempotent (keyed by event id). */
export interface EventConsumer {
  name: string;
  handle: (tx: Db, event: EventRow) => Promise<void>;
}

/**
 * One queue per consumer, one job per event: a consumer that fails retries
 * its own job and holds up no other consumer or event. The job runs in the
 * event's organisation, with its writes committing together with the job's
 * end. 10 attempts, each wait about twice the last (2 min first): 9 to 17
 * hours in all, then the job stays failed until retried
 * (`POST /events/failures/retry`).
 * The insert trigger on core_events, core_event_jobs(), adds a job to every
 * `event.*` queue, so a consumer taken out deletes its queue in a migration
 * (`core_queue.delete_queue`).
 */
export const consumerJob = (consumer: EventConsumer) =>
  defineJob({
    queue: `${EVENT_QUEUE_PREFIX}${consumer.name}`,
    payload: z.object({ eventId: z.string() }),
    atomic: true,
    retry: { attempts: 10, delay: 120, maxDelay: 12 * 3600 },
    concurrency: 2,
    async handle(job, tx) {
      const [event] = await tx
        .select()
        .from(events)
        .where(eq(events.id, job.payload.eventId))
        .limit(1);

      // Removed by retention before it was handled: nothing left to do.
      if (event) await consumer.handle(tx, event);
    },
  });

const CONSUMERS: EventConsumer[] = [
  timelineConsumer,
  notificationsConsumer,
  webhooksConsumer,
  automationsConsumer,
  pluginEventsConsumer,
];

export const CONSUMER_JOBS = CONSUMERS.map(consumerJob);
