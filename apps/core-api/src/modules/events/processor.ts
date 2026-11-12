import { type Db, eventConsumers, eventFailures, events, withSystem } from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { liveHub } from '~/modules/live/hub';
import { describeError } from '~/modules/jobs/jobs';
import { webhooksConsumer } from '~/modules/webhooks/webhookDelivery';
import { automationsConsumer } from '~/modules/automations/consumer';
import { pluginEventsConsumer } from '~/modules/plugins/pluginEvents';
import { logger, traced } from '~/logger';
import { notificationsConsumer, timelineConsumer } from './coreConsumers';

const log = logger.child({ component: 'events' });

type EventRow = typeof events.$inferSelect;

/** A consumer turns events into something; it must be idempotent (keyed by event id). */
export interface EventConsumer {
  name: string;
  handle: (tx: Db, event: EventRow) => Promise<void>;
}

export const CONSUMERS: EventConsumer[] = [
  timelineConsumer,
  notificationsConsumer,
  webhooksConsumer,
  automationsConsumer,
  pluginEventsConsumer,
];

/** Waits before each retry; after the last one the event is dead. */
const RETRY_DELAYS_SECONDS = [60, 5 * 60, 30 * 60, 2 * 60 * 60, 12 * 60 * 60];
export const MAX_ATTEMPTS = RETRY_DELAYS_SECONDS.length + 1;

const handleOnce = async (tx: Db, consumer: EventConsumer, event: EventRow) => {
  try {
    await tx.transaction((savepoint) => consumer.handle(savepoint, event));

    return null;
  } catch (error) {
    // Drizzle wraps database errors ("Failed query: …"); the causes say why.
    return describeError(error);
  }
};

/** A failure's next state after `attempts` tries. */
const afterAttempt = (attempts: number) => {
  const delay = RETRY_DELAYS_SECONDS[attempts - 1];

  return delay === undefined
    ? { status: 'dead' as const, nextAttemptAt: null }
    : {
        status: 'retrying' as const,
        nextAttemptAt: sql`now() + make_interval(secs => ${delay})`,
      };
};

const eventsById = async (tx: Db, ids: string[]) => {
  const rows = await tx.select().from(events).where(inArray(events.id, ids));

  return new Map(rows.map((row) => [row.id, row]));
};

/** The next events after the consumer's cursor, in commit order (locks the cursor). */
const nextBatch = async (tx: Db, consumer: EventConsumer, batchSize: number) => {
  await tx.insert(eventConsumers).values({ name: consumer.name }).onConflictDoNothing();

  const cursor = await tx.execute<{ last_tx_id: string; last_seq: number }>(
    sql`select last_tx_id::text, last_seq from ${eventConsumers} where name = ${consumer.name} for update skip locked`,
  );

  const position = cursor.rows[0];

  if (!position) {
    return [];
  }

  const batch = await tx.execute<{ id: string; tx_id: string; seq: number }>(sql`
    select id, tx_id::text, seq from ${events}
    where (tx_id, seq) > (${position.last_tx_id}::xid8, ${position.last_seq})
      and tx_id < pg_snapshot_xmin(pg_current_snapshot())
    order by tx_id, seq
    limit ${batchSize}
  `);

  return batch.rows;
};

/**
 * Runs one consumer over the next batch of events, in commit order. Only
 * finished transactions are read (`tx_id` below the oldest running one), so an
 * event committed late is never skipped. The consumer's row is locked
 * (`SKIP LOCKED`), so on several replicas one runs while the others move on.
 * The cursor and the consumer's writes commit together; an event that fails
 * goes to `core_event_failures` (retried with backoff) so it can't block the stream.
 */
export const runConsumer = async (consumer: EventConsumer, batchSize = 200): Promise<number> =>
  withSystem(`events: ${consumer.name}`, async (tx) => {
    const batch = await nextBatch(tx, consumer, batchSize);
    const last = batch.at(-1);

    if (!last) {
      return 0;
    }

    const byId = await eventsById(
      tx,
      batch.map((row) => row.id),
    );

    // In commit order: the batch's, not the lookup's.
    for (const event of batch.flatMap((row) => byId.get(row.id) ?? [])) {
      const error = await handleOnce(tx, consumer, event);

      if (error) {
        log.error(
          { consumer: consumer.name, eventId: event.id, type: event.type, error },
          'could not handle an event; retrying later',
        );
        await tx
          .insert(eventFailures)
          .values({
            consumer: consumer.name,
            eventId: event.id,
            orgId: event.orgId,
            lastError: error,
            ...afterAttempt(1),
          })
          .onConflictDoNothing();
      }
    }

    await tx.execute(
      sql`update ${eventConsumers} set last_tx_id = ${last.tx_id}::xid8, last_seq = ${last.seq}, updated_at = now() where name = ${consumer.name}`,
    );

    return batch.length;
  });

/**
 * Retries a consumer's failed events that are due. Rows are locked
 * (`SKIP LOCKED`), so replicas share the work; success removes the failure,
 * another error schedules the next attempt or marks the event dead.
 */
export const retryFailures = async (consumer: EventConsumer, batchSize = 50): Promise<number> =>
  withSystem(`events retry: ${consumer.name}`, async (tx) => {
    const due = await tx.execute<{ event_id: string; attempts: number }>(sql`
      select event_id, attempts from ${eventFailures}
      where consumer = ${consumer.name} and status = 'retrying' and next_attempt_at <= now()
      order by next_attempt_at
      limit ${batchSize}
      for update skip locked
    `);

    if (!due.rows.length) return 0;

    const byId = await eventsById(
      tx,
      due.rows.map((row) => row.event_id),
    );

    for (const failure of due.rows) {
      const event = byId.get(failure.event_id);

      const where = and(
        eq(eventFailures.consumer, consumer.name),
        eq(eventFailures.eventId, failure.event_id),
      );

      const error = event ? await handleOnce(tx, consumer, event) : null;

      if (!error) {
        await tx.delete(eventFailures).where(where);
        continue;
      }

      const attempts = failure.attempts + 1;
      const next = afterAttempt(attempts);

      if (next.status === 'dead') {
        log.error(
          { consumer: consumer.name, eventId: failure.event_id, attempts, error },
          'gave up on an event',
        );
      }

      await tx
        .update(eventFailures)
        .set({ attempts, lastError: error, ...next, updatedAt: sql`now()` })
        .where(where);
    }

    return due.rows.length;
  });

/** Retries due failures, then reads the stream until caught up; returns how many events it read. */
const drain = async (consumer: EventConsumer) => {
  let handled = 0;

  for (let round = 0; round < 10; round += 1) {
    if (!(await retryFailures(consumer))) break;
  }

  for (let round = 0; round < 50; round += 1) {
    const read = await runConsumer(consumer);

    handled += read;

    if (!read) break;
  }

  return handled;
};

/**
 * Runs every consumer until the stream is caught up (tests, and each tick).
 * Consumers are independent (own cursor, own transactions): they run side by
 * side, so a slow one doesn't hold up the timeline or notifications.
 */
export const processEvents = async () => {
  const counts = await Promise.all(CONSUMERS.map(drain));

  return counts.reduce((sum, handled) => sum + handled, 0);
};

/**
 * Runs the consumers when new events are announced (LISTEN, instantly), with
 * a slow safety poll; while the server can't listen it polls every second.
 */
export const startEventProcessor = () => {
  let current: Promise<void> | null = null;
  let again = false;
  let stopped = false;

  const run = () => {
    if (stopped) return;

    if (current) {
      again = true;

      return;
    }

    current = traced('events', processEvents)
      .then(() => undefined)
      .catch((error: unknown) => log.error({ err: error }, 'event processing failed'))
      .finally(() => {
        current = null;

        if (again) {
          again = false;
          run();
        }
      });
  };

  let last = 0;

  const poll = setInterval(() => {
    const interval = liveHub.connected ? 30_000 : 1000;

    if (Date.now() - last >= interval) {
      last = Date.now();
      run();
    }
  }, 1000);

  // An event is read only once every transaction older than it has finished
  // (anywhere on the server): the run woken by its NOTIFY can be too early.
  // Look again shortly after, instead of waiting for the safety poll.
  const followUps = new Set<NodeJS.Timeout>();

  const onEvents = () => {
    last = Date.now();
    run();

    for (const delay of [300, 1000, 3000, 8000]) {
      const timer = setTimeout(() => {
        followUps.delete(timer);
        run();
      }, delay);

      timer.unref();
      followUps.add(timer);
    }
  };

  poll.unref();
  liveHub.on('events', onEvents);

  /** Stops, after the run in progress (if any) finishes. */
  return async () => {
    stopped = true;
    clearInterval(poll);
    followUps.forEach((followUp) => clearTimeout(followUp));
    liveHub.off('events', onEvents);
    await current;
  };
};
