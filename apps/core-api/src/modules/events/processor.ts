import { EventNotify } from '@erxes/core-contract';
import {
  activities,
  companies,
  customers,
  db,
  type Db,
  eventConsumers,
  eventFailures,
  events,
} from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { logger, traced } from '~/logger';
import { liveHub } from '~/modules/live/hub';
import { notify } from '~/modules/notifications/notifications.service';

type EventRow = typeof events.$inferSelect;

const log = logger.child({ component: 'events' });

/** A consumer turns events into something; it must be idempotent (keyed by event id). */
export interface EventConsumer {
  name: string;
  handle: (tx: Db, event: EventRow) => Promise<void>;
}

const callerOf = (event: EventRow): Caller => ({
  orgId: event.orgId,
  actorType: event.actorType === 'user' ? 'user' : 'plugin',
  actorId: event.actorId ?? event.source,
  source: event.source,
});

/**
 * Plugin events about a customer or company with a `summary` go on its
 * timeline; the record's owner hears about it in that plugin's inbox.
 */
const timeline: EventConsumer = {
  name: 'core.timeline',
  async handle(tx, event) {
    if (event.source === 'core' || !event.subjectType || !event.subjectId || !event.summary) {
      return;
    }

    const table = event.subjectType === 'customer' ? customers : companies;

    const [subject] = await tx
      .select({ ownerId: table.ownerId })
      .from(table)
      .where(and(eq(table.orgId, event.orgId), eq(table.id, event.subjectId)))
      .limit(1);

    if (!subject) {
      return;
    }

    const [entry] = await tx
      .insert(activities)
      .values({
        id: event.id,
        orgId: event.orgId,
        targetType: event.subjectType,
        targetId: event.subjectId,
        source: event.source,
        type: event.type,
        summary: event.summary,
        data: event.payload,
        entityType: event.entityType,
        entityId: event.entityId,
        link: event.link,
        actorType: event.actorType,
        actorId: event.actorId,
        dedupeKey: `event:${event.id}`,
        occurredAt: event.occurredAt,
      })
      .onConflictDoNothing()
      .returning({ id: activities.id });

    if (entry && subject.ownerId && subject.ownerId !== event.actorId) {
      await notify(tx, callerOf(event), {
        userIds: [subject.ownerId],
        kind: event.type,
        title: event.summary,
        link:
          event.link ??
          `/contacts/${event.subjectType === 'customer' ? 'customers' : 'companies'}/${event.subjectId}`,
        entity: {
          type: event.entityType ?? event.subjectType,
          id: event.entityId ?? event.subjectId,
        },
        data: { targetType: event.subjectType, targetId: event.subjectId },
        actorUserId: event.actorType === 'user' ? (event.actorId ?? undefined) : undefined,
        dedupeKey: `event:${event.id}:owner`,
      });
    }
  },
};

/** Events with `notify` reach those members' inboxes. */
const notifications: EventConsumer = {
  name: 'core.notifications',
  async handle(tx, event) {
    if (event.notify === null || event.source === 'core') {
      return;
    }

    // core_publish_event() checks only the recipient count, so a plugin can
    // store a request POST /events would refuse. The ZodError fails the event
    // like any other error: core_event_failures, then Settings › Event delivery.
    const request = EventNotify.parse(event.notify);

    await notify(tx, callerOf(event), {
      userIds: request.userIds,
      kind: event.type,
      title: request.title,
      body: request.body,
      link: request.link ?? event.link ?? undefined,
      priority: request.priority,
      entity:
        event.entityType && event.entityId
          ? { type: event.entityType, id: event.entityId }
          : undefined,
      actorUserId: event.actorType === 'user' ? (event.actorId ?? undefined) : undefined,
      dedupeKey: `event:${event.id}`,
    });
  },
};

export const CONSUMERS: EventConsumer[] = [timeline, notifications];

/** Waits before each retry; after the last one the event is dead. */
const RETRY_DELAYS_SECONDS = [60, 5 * 60, 30 * 60, 2 * 60 * 60, 12 * 60 * 60];
export const MAX_ATTEMPTS = RETRY_DELAYS_SECONDS.length + 1;

const describe = (error: unknown): string => {
  const messages: string[] = [];
  let current: unknown = error;

  // Drizzle wraps database errors ("Failed query: …"); the cause says why.
  for (let depth = 0; current && depth < 4; depth += 1) {
    messages.push(current instanceof Error ? current.message : JSON.stringify(current));
    current = current instanceof Error ? current.cause : undefined;
  }

  return messages.join(' — ').slice(0, 2000);
};

/**
 * Handles one event in a savepoint. A failure is logged with the event and
 * comes back described for `core_event_failures`.
 */
const handleOnce = async (tx: Db, consumer: EventConsumer, event: EventRow) => {
  const eventLog = log.child({
    consumer: consumer.name,
    eventId: event.id,
    eventType: event.type,
    orgId: event.orgId,
  });

  try {
    await tx.transaction((savepoint) => consumer.handle(savepoint, event));
    eventLog.info('event handled');

    return null;
  } catch (error) {
    eventLog.error({ err: error }, 'event failed');

    return describe(error);
  }
};

/** A failure's next state after `attempts` tries. */
const afterAttempt = (attempts: number) =>
  attempts >= MAX_ATTEMPTS
    ? { status: 'dead' as const, nextAttemptAt: null }
    : {
        status: 'retrying' as const,
        nextAttemptAt: sql`now() + make_interval(secs => ${RETRY_DELAYS_SECONDS[attempts - 1]!})`,
      };

/**
 * Runs one consumer over the next batch of events, in commit order. Only
 * finished transactions are read (`tx_id` below the oldest running one), so an
 * event committed late is never skipped. The consumer's row is locked
 * (`SKIP LOCKED`), so on several replicas one runs while the others move on.
 * The cursor and the consumer's writes commit together; an event that fails
 * goes to `core_event_failures` (retried with backoff) so it can't block the
 * stream. Each run is one span, so its queries and log lines share a trace.
 */
export const runConsumer = async (consumer: EventConsumer, batchSize = 200): Promise<number> =>
  traced(`events ${consumer.name}`, () =>
    db().transaction(async (tx) => {
      await tx.insert(eventConsumers).values({ name: consumer.name }).onConflictDoNothing();

      const cursor = await tx.execute<{ last_tx_id: string; last_seq: number }>(
        sql`select last_tx_id::text, last_seq from ${eventConsumers} where name = ${consumer.name} for update skip locked`,
      );

      const position = cursor.rows[0];

      if (!position) {
        return 0;
      }

      const batch = await tx.execute<{ id: string; tx_id: string; seq: number }>(sql`
      select id, tx_id::text, seq from ${events}
      where (tx_id, seq) > (${position.last_tx_id}::xid8, ${position.last_seq})
        and tx_id < pg_snapshot_xmin(pg_current_snapshot())
      order by tx_id, seq
      limit ${batchSize}
    `);

      if (!batch.rows.length) {
        return 0;
      }

      const rows = await tx
        .select()
        .from(events)
        .where(
          sql`${events.id} in (${sql.join(
            batch.rows.map((row) => sql`${row.id}`),
            sql`, `,
          )})`,
        );

      const byId = new Map(rows.map((row) => [row.id, row]));

      for (const { id } of batch.rows) {
        const event = byId.get(id)!;
        const error = await handleOnce(tx, consumer, event);

        if (error) {
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

      const last = batch.rows[batch.rows.length - 1]!;

      await tx.execute(
        sql`update ${eventConsumers} set last_tx_id = ${last.tx_id}::xid8, last_seq = ${last.seq}, updated_at = now() where name = ${consumer.name}`,
      );

      return batch.rows.length;
    }),
  );

/**
 * Retries a consumer's failed events that are due. Rows are locked
 * (`SKIP LOCKED`), so replicas share the work; success removes the failure,
 * another error schedules the next attempt or marks the event dead.
 */
export const retryFailures = async (consumer: EventConsumer, batchSize = 50): Promise<number> =>
  traced(`events retry ${consumer.name}`, () =>
    db().transaction(async (tx) => {
      const due = await tx.execute<{ event_id: string; attempts: number }>(sql`
      select event_id, attempts from ${eventFailures}
      where consumer = ${consumer.name} and status = 'retrying' and next_attempt_at <= now()
      order by next_attempt_at
      limit ${batchSize}
      for update skip locked
    `);

      if (!due.rows.length) return 0;

      const rows = await tx
        .select()
        .from(events)
        .where(
          sql`${events.id} in (${sql.join(
            due.rows.map((row) => sql`${row.event_id}`),
            sql`, `,
          )})`,
        );

      const byId = new Map(rows.map((row) => [row.id, row]));

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
            { consumer: consumer.name, eventId: failure.event_id, attempts },
            'event dead after the last attempt',
          );
        }

        await tx
          .update(eventFailures)
          .set({ attempts, lastError: error, ...next, updatedAt: sql`now()` })
          .where(where);
      }

      return due.rows.length;
    }),
  );

/** Runs every consumer until the stream is caught up, then due retries (tests, and each tick). */
export const processEvents = async () => {
  let handled = 0;

  for (const consumer of CONSUMERS) {
    for (let round = 0; round < 10; round += 1) {
      if (!(await retryFailures(consumer))) break;
    }
  }

  for (const consumer of CONSUMERS) {
    for (let round = 0; round < 50; round += 1) {
      const count = await runConsumer(consumer);

      handled += count;

      if (!count) break;
    }
  }

  return handled;
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

    current = processEvents()
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

  const timer = setInterval(() => {
    const interval = liveHub.connected ? 30_000 : 1000;

    if (Date.now() - last >= interval) {
      last = Date.now();
      run();
    }
  }, 1000);

  const onEvents = () => {
    last = Date.now();
    run();
  };

  timer.unref();
  liveHub.on('events', onEvents);

  /** Stops, after the run in progress (if any) finishes. */
  return async () => {
    stopped = true;
    clearInterval(timer);
    liveHub.off('events', onEvents);
    await current;
  };
};
