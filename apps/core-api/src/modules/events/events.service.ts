import type { CoreEvent, CursorQuery, EventFailure, EventInput } from '@erxes/core-contract';
import { type Db, eventConsumers, eventFailures, events, newId } from '@erxes/core-db';
import { and, desc, eq, inArray, like, or, sql } from 'drizzle-orm';
import {
  type Actor,
  type Caller,
  type PluginCaller,
  requirePermission,
  userCaller,
} from '~/http/auth';
import { recordAudit } from '~/modules/audit/audit.service';
import { HttpError } from '~/http/errors';
import { assertMembers, assertPluginNamespace } from '~/lib/guards';
import { currentRunCause, currentImport } from '~/lib/causation';
import { keysetPage } from '~/lib/keyset';
import { deleteInBatches } from '~/lib/sequence';
import { assertTargets } from '~/modules/activities/timelineAccess';

type EventRow = typeof events.$inferSelect;

export const toEventDto = (row: EventRow): CoreEvent => ({
  id: row.id,
  source: row.source,
  type: row.type,
  version: row.version,
  subject: row.subjectType && row.subjectId ? { type: row.subjectType, id: row.subjectId } : null,
  entity: row.entityType && row.entityId ? { type: row.entityType, id: row.entityId } : null,
  actor: { type: row.actorType, id: row.actorId },
  payload: row.payload,
  summary: row.summary,
  link: row.link,
  occurredAt: row.occurredAt.toISOString(),
  createdAt: row.createdAt.toISOString(),
});

export interface CoreEventInput {
  type: string;
  subject?: EventInput['subject'];
  entity?: { type: string; id: string };
  payload?: Record<string, unknown>;
}

/**
 * Core publishes its own events (`core.customer.created`, …) in the same
 * transaction as the change, for automations and webhooks to come.
 */
export const publishCoreEvents = async (
  client: Db,
  caller: Caller,
  inputs: CoreEventInput | CoreEventInput[],
) => {
  const list = Array.isArray(inputs) ? inputs : [inputs];

  if (!list.length) {
    return;
  }

  const cause = currentRunCause();
  const imported = currentImport();

  await client.insert(events).values(
    list.map((input) => ({
      id: newId(),
      orgId: caller.orgId,
      source: 'core',
      type: input.type,
      subjectType: input.subject?.type ?? null,
      subjectId: input.subject?.id ?? null,
      entityType: input.entity?.type ?? null,
      entityId: input.entity?.id ?? null,
      actorType: caller.actorType,
      actorId: caller.actorId,
      payload: imported
        ? { ...input.payload, _import: { id: imported.importId, quiet: imported.quiet } }
        : (input.payload ?? {}),
      // Caused by an automation's action: that run, one level deeper.
      causedByRun: cause?.runId ?? null,
      depth: cause ? cause.depth + 1 : 0,
    })),
  );
};

/**
 * A plugin publishes events over HTTP (plugins on core's database use
 * `core_publish_event()` in their own transaction instead). Each event is
 * checked here, so mistakes come back as errors rather than being dropped.
 */
export const publishPluginEvents = async (
  client: Db,
  caller: PluginCaller,
  inputs: EventInput[],
) => {
  for (const input of inputs) {
    assertPluginNamespace(caller.plugin, input.type);

    if (input.summary && !input.subject) {
      throw new HttpError(
        400,
        'SUBJECT_REQUIRED',
        'A timeline summary needs a subject (customer or company)',
      );
    }
  }

  await assertTargets(
    client,
    caller.orgId,
    inputs.flatMap((input) => input.subject ?? []),
  );
  await assertMembers(
    client,
    caller.orgId,
    inputs.map((input) => input.actorUserId),
  );

  const inserted = await client
    .insert(events)
    .values(
      inputs.map((input) => ({
        id: newId(),
        orgId: caller.orgId,
        source: caller.plugin,
        type: input.type,
        version: input.version,
        subjectType: input.subject?.type ?? null,
        subjectId: input.subject?.id ?? null,
        entityType: input.entity?.type ?? null,
        entityId: input.entity?.id ?? null,
        actorType: input.actorUserId ? ('user' as const) : ('plugin' as const),
        actorId: input.actorUserId ?? caller.plugin,
        payload: input.payload,
        summary: input.summary ?? null,
        link: input.link ?? null,
        notify: input.notify ?? null,
        dedupeKey: input.dedupeKey ?? null,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : sql`now()`,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: events.id });

  return { published: inserted.length, duplicates: inputs.length - inserted.length };
};

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const listEvents = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & {
    source?: string;
    type?: string;
    subjectType?: NonNullable<EventInput['subject']>['type'];
    subjectId?: string;
  },
) => {
  requirePermission(actor, 'events.view');

  const filters = and(
    query.source ? eq(events.source, query.source) : undefined,
    query.type
      ? /[.*]$/.test(query.type)
        ? like(events.type, `${escapeLike(query.type.replace(/\*$/, ''))}%`)
        : eq(events.type, query.type)
      : undefined,
    query.subjectType ? eq(events.subjectType, query.subjectType) : undefined,
    query.subjectId ? eq(events.subjectId, query.subjectId) : undefined,
  );

  const page = await keysetPage(
    client,
    {
      table: events,
      id: events.id,
      createdAt: events.createdAt,
      scope: eq(events.orgId, actor.orgId),
      countCap: 10_000,
    },
    filters,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(events)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toEventDto) };
};

// ─── Failed deliveries ──────────────────────────────────────────────────────

export const listEventFailures = async (
  client: Db,
  actor: Actor,
  query: { status?: EventFailure['status'] },
) => {
  requirePermission(actor, 'events.view');

  const rows = await client
    .select({ failure: eventFailures, event: events })
    .from(eventFailures)
    .innerJoin(events, eq(events.id, eventFailures.eventId))
    .where(
      and(
        eq(eventFailures.orgId, actor.orgId),
        query.status ? eq(eventFailures.status, query.status) : undefined,
      ),
    )
    .orderBy(desc(eventFailures.updatedAt))
    .limit(200);

  const counts = await client
    .select({ status: eventFailures.status, count: sql<number>`count(*)::int` })
    .from(eventFailures)
    .where(eq(eventFailures.orgId, actor.orgId))
    .groupBy(eventFailures.status);

  return {
    data: rows.map(({ failure, event }): EventFailure => ({
      consumer: failure.consumer,
      status: failure.status,
      attempts: failure.attempts,
      lastError: failure.lastError,
      nextAttemptAt: failure.nextAttemptAt?.toISOString() ?? null,
      firstFailedAt: failure.firstFailedAt.toISOString(),
      updatedAt: failure.updatedAt.toISOString(),
      event: toEventDto(event),
    })),
    counts: {
      retrying: counts.find((row) => row.status === 'retrying')?.count ?? 0,
      dead: counts.find((row) => row.status === 'dead')?.count ?? 0,
    },
  };
};

type FailureRef = { consumer: string; eventId: string };

const refsWhere = (orgId: string, refs: FailureRef[]) =>
  and(
    eq(eventFailures.orgId, orgId),
    or(
      ...refs.map((ref) =>
        and(eq(eventFailures.consumer, ref.consumer), eq(eventFailures.eventId, ref.eventId)),
      ),
    ),
  );

/** Tries failed events again now (one more attempt each); wakes the processor. */
export const retryEventFailures = async (
  client: Db,
  actor: Actor,
  input: { failures?: FailureRef[]; allDead?: boolean },
) => {
  requirePermission(actor, 'events.view');

  if (!input.failures?.length && !input.allDead) {
    throw new HttpError(400, 'NOTHING_TO_RETRY', 'Name the failures to retry, or all dead ones');
  }

  return client.transaction(async (tx) => {
    const retried = await tx
      .update(eventFailures)
      .set({ status: 'retrying', nextAttemptAt: sql`now()`, updatedAt: sql`now()` })
      .where(
        input.failures?.length
          ? refsWhere(actor.orgId, input.failures)
          : and(eq(eventFailures.orgId, actor.orgId), eq(eventFailures.status, 'dead')),
      )
      .returning({ eventId: eventFailures.eventId, consumer: eventFailures.consumer });

    if (retried.length) {
      await recordAudit(tx, userCaller(actor), {
        action: 'event.failures_retried',
        targetType: 'event',
        metadata: { count: retried.length, failures: retried.slice(0, 50) },
      });
      await tx.execute(sql`select pg_notify('core_events', '')`);
    }

    return { retried: retried.length };
  });
};

/** Gives up on failed events: they won't be retried or shown again. */
export const dismissEventFailures = async (
  client: Db,
  actor: Actor,
  input: { failures: FailureRef[] },
) => {
  requirePermission(actor, 'events.view');

  return client.transaction(async (tx) => {
    const dismissed = await tx
      .delete(eventFailures)
      .where(refsWhere(actor.orgId, input.failures))
      .returning({ eventId: eventFailures.eventId, consumer: eventFailures.consumer });

    if (dismissed.length) {
      await recordAudit(tx, userCaller(actor), {
        action: 'event.failures_dismissed',
        targetType: 'event',
        metadata: { count: dismissed.length, failures: dismissed.slice(0, 50) },
      });
    }

    return { dismissed: dismissed.length };
  });
};

/**
 * Removes events older than the retention period that every consumer has
 * passed and none still has to retry. Consumers that never ran hold
 * everything back.
 */
export const pruneEvents = async (
  client: Db,
  days: number,
  consumerNames: string[],
  batchSize = 5000,
) => {
  if (!consumerNames.length) return 0;

  const positions = await client
    .select({ name: eventConsumers.name })
    .from(eventConsumers)
    .where(inArray(eventConsumers.name, consumerNames));

  if (positions.length < consumerNames.length) return 0;

  return deleteInBatches(100, batchSize, () =>
    client.execute(sql`
      delete from ${events} e
      where e.id in (
        select id from ${events} old
        where old.created_at < now() - make_interval(days => ${days})
          and not exists (
            select 1 from ${eventConsumers} c
            where c.name in (${sql.join(
              consumerNames.map((name) => sql`${name}`),
              sql`, `,
            )})
              and (old.tx_id, old.seq) > (c.last_tx_id, c.last_seq)
          )
          and not exists (select 1 from ${eventFailures} f where f.event_id = old.id)
        limit ${batchSize}
      )
    `),
  );
};
