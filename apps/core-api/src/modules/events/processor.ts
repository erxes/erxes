import { activities, companies, customers, db, type Db, eventConsumers, events } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { Caller } from '~/http/auth';
import { notify } from '~/modules/notifications/notifications.service';

type EventRow = typeof events.$inferSelect;

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
        link: event.link ?? `/contacts/${event.subjectType === 'customer' ? 'customers' : 'companies'}/${event.subjectId}`,
        entity: { type: event.entityType ?? event.subjectType, id: event.entityId ?? event.subjectId },
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
    const request = event.notify as
      | { userIds: string[]; title: string; body?: string; link?: string; priority?: 'normal' | 'high' }
      | null;

    if (!request?.userIds?.length || event.source === 'core') {
      return;
    }

    await notify(tx, callerOf(event), {
      userIds: request.userIds,
      kind: event.type,
      title: request.title,
      body: request.body,
      link: request.link ?? event.link ?? undefined,
      priority: request.priority,
      entity: event.entityType && event.entityId ? { type: event.entityType, id: event.entityId } : undefined,
      actorUserId: event.actorType === 'user' ? (event.actorId ?? undefined) : undefined,
      dedupeKey: `event:${event.id}`,
    });
  },
};

export const CONSUMERS: EventConsumer[] = [timeline, notifications];

/**
 * Runs one consumer over the next batch of events, in commit order. Only
 * finished transactions are read (`tx_id` below the oldest running one), so an
 * event committed late is never skipped. The consumer's row is locked
 * (`SKIP LOCKED`), so on several replicas one runs while the others move on.
 * The cursor and the consumer's writes commit together; an event that fails
 * is logged and passed over so it can't block the stream.
 */
export const runConsumer = async (consumer: EventConsumer, batchSize = 200): Promise<number> =>
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
      .where(sql`${events.id} in (${sql.join(batch.rows.map((row) => sql`${row.id}`), sql`, `)})`);
    const byId = new Map(rows.map((row) => [row.id, row]));

    for (const { id } of batch.rows) {
      const event = byId.get(id)!;

      try {
        await tx.transaction((savepoint) => consumer.handle(savepoint, event));
      } catch (error) {
        console.error(`[core] ${consumer.name} could not handle event ${event.id} (${event.type})`, error);
      }
    }

    const last = batch.rows[batch.rows.length - 1]!;

    await tx.execute(
      sql`update ${eventConsumers} set last_tx_id = ${last.tx_id}::xid8, last_seq = ${last.seq}, updated_at = now() where name = ${consumer.name}`,
    );

    return batch.rows.length;
  });

/** Runs every consumer until the stream is caught up (tests, and each tick). */
export const processEvents = async () => {
  let handled = 0;

  for (const consumer of CONSUMERS) {
    for (let round = 0; round < 50; round += 1) {
      const count = await runConsumer(consumer);

      handled += count;

      if (!count) break;
    }
  }

  return handled;
};

/** Polls the stream every second (no LISTEN/NOTIFY: core may sit behind a pooler). */
export const startEventProcessor = () => {
  let running = false;
  const timer = setInterval(() => {
    if (running) return;

    running = true;
    processEvents()
      .catch((error: unknown) => console.error('[core] event processing failed', error))
      .finally(() => {
        running = false;
      });
  }, 1000);

  timer.unref();

  return () => clearInterval(timer);
};
