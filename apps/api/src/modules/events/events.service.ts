import type { ActivityTarget, CursorQuery, EventFailure, EventInput } from '@erxes/core-contract';
import { actorOf, caller, type Db, events, newId } from '@erxes/core-db';
import { and, eq, inArray, like, sql } from 'drizzle-orm';
import { recordAudit } from '~/modules/audit/audit.service';
import { fail } from '~/http/errors';
import { assertMembers, assertPluginNamespace } from '~/lib/guards';
import { currentRunCause, currentImport } from '~/lib/causation';
import { keysetPage } from '~/lib/keyset';
import { deleteInBatches } from '~/lib/sequence';
import { assertTargets } from '~/modules/activities/timelineAccess';
import {
  deleteJobs,
  type FailedJob,
  failedJobCounts,
  failedJobs,
  retryJobs,
} from '~/modules/jobs/failed';
import { storedError } from '~/modules/jobs/jobs';

export type CoreEventInput = Pick<
  typeof events.$inferInsert,
  'type' | 'subjectType' | 'subjectId' | 'entityType' | 'entityId' | 'payload'
>;

/**
 * Core publishes its own events (`core.customer.created`, …) in the same
 * transaction as the change, for automations and webhooks to come.
 */
export const publishCoreEvents = async (client: Db, inputs: CoreEventInput | CoreEventInput[]) => {
  const list = Array.isArray(inputs) ? inputs : [inputs];

  if (!list.length) {
    return;
  }

  const cause = currentRunCause();
  const imported = currentImport();
  const actor = actorOf(caller());

  await client.insert(events).values(
    list.map((input) => ({
      id: newId(),
      source: 'core',
      ...input,
      ...actor,
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
export const publishPluginEvents = async (client: Db, inputs: EventInput[]) => {
  const { plugin } = caller('plugin');

  for (const input of inputs) {
    assertPluginNamespace(plugin, input.type);

    if (input.summary && !input.subjectId) {
      throw fail('SUBJECT_REQUIRED', 'A timeline summary needs a subject (customer or company)');
    }
  }

  await assertTargets(
    client,
    inputs.flatMap(({ subjectType, subjectId }) =>
      subjectType && subjectId ? [{ type: subjectType, id: subjectId }] : [],
    ),
  );
  await assertMembers(
    client,
    inputs.map((input) => input.actorUserId),
  );

  const inserted = await client
    .insert(events)
    .values(
      inputs.map((input) => ({
        id: newId(),
        source: plugin,
        type: input.type,
        version: input.version,
        subjectType: input.subjectType ?? null,
        subjectId: input.subjectId ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        actorType: input.actorUserId ? ('user' as const) : ('plugin' as const),
        actorId: input.actorUserId ?? plugin,
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
  query: CursorQuery & {
    source?: string;
    type?: string;
    subjectType?: ActivityTarget;
    subjectId?: string;
  },
) => {
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

  return keysetPage(
    client,
    {
      table: events,
      id: events.id,
      createdAt: events.createdAt,

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
};

// ─── Failed deliveries ──────────────────────────────────────────────────────

/** Each consumer's queue (`modules/events/consumers.ts`); the core_events insert trigger fills every `event.*` queue. */
export const EVENT_QUEUE_PREFIX = 'event.';

const STATUS = { retry: 'retrying', failed: 'dead' } as const;
const STATE = { retrying: 'retry', dead: 'failed' } as const;

type FailureRef = { consumer: string; eventId: string };

/** A consumer's failed job for an event: its queue and its dedupe key, the event id. */
const refsOf = (refs: FailureRef[]) =>
  refs.map((ref) => ({ name: `${EVENT_QUEUE_PREFIX}${ref.consumer}`, key: ref.eventId }));

const failureOf = (job: FailedJob) => ({
  consumer: job.name.slice(EVENT_QUEUE_PREFIX.length),
  eventId: job.key,
});

export const listEventFailures = async (client: Db, query: { status?: EventFailure['status'] }) => {
  const failed = await failedJobs(client, EVENT_QUEUE_PREFIX, {
    state: query.status && STATE[query.status],
    limit: 200,
  });

  const rows = failed.length
    ? await client
        .select()
        .from(events)
        .where(
          inArray(
            events.id,
            failed.map((job) => job.key),
          ),
        )
    : [];

  const byId = new Map(rows.map((row) => [row.id, row]));
  const counts = await failedJobCounts(client, EVENT_QUEUE_PREFIX);

  return {
    // An event removed by retention has nothing left to show or retry.
    data: failed.flatMap((job) => {
      const event = byId.get(job.key);

      return event
        ? [
            {
              consumer: failureOf(job).consumer,
              status: STATUS[job.state],
              attempts: job.attempts,
              lastError: storedError(job.output),
              failedAt: job.failedAt,
              nextAttemptAt: job.nextAttemptAt,
              event,
            },
          ]
        : [];
    }),
    counts: { retrying: counts.retry, dead: counts.failed },
  };
};

/** Tries failed events again now (one more attempt each). */
export const retryEventFailures = async (
  client: Db,
  input: { failures?: FailureRef[]; allDead?: boolean },
) => {
  if (!input.failures?.length && !input.allDead) {
    throw fail('NOTHING_TO_RETRY', 'Name the failures to retry, or all dead ones');
  }

  const failed = await failedJobs(
    client,
    EVENT_QUEUE_PREFIX,
    input.failures?.length
      ? { refs: refsOf(input.failures), limit: 200 }
      : { state: 'failed', limit: 10_000 },
  );

  await retryJobs(client, failed);

  if (failed.length) {
    await recordAudit(client, {
      action: 'event.failures_retried',
      targetType: 'event',
      metadata: { count: failed.length, failures: failed.slice(0, 50).map(failureOf) },
    });
  }

  return { retried: failed.length };
};

/** Gives up on failed events: they won't be retried or shown again. */
export const dismissEventFailures = async (client: Db, input: { failures: FailureRef[] }) => {
  const failed = await failedJobs(client, EVENT_QUEUE_PREFIX, {
    refs: refsOf(input.failures),
    limit: 200,
  });

  await deleteJobs(client, failed);

  if (failed.length) {
    await recordAudit(client, {
      action: 'event.failures_dismissed',
      targetType: 'event',
      metadata: { count: failed.length, failures: failed.slice(0, 50).map(failureOf) },
    });
  }

  return { dismissed: failed.length };
};

/**
 * Removes events older than the retention period. A consumer job whose event
 * is gone has nothing left to do and ends.
 */
export const pruneEvents = (client: Db, days: number, batchSize = 5000) =>
  deleteInBatches(100, batchSize, () =>
    client.execute(sql`
      delete from ${events} where id in (
        select id from ${events}
        where created_at < now() - make_interval(days => ${days})
        limit ${batchSize}
      )
    `),
  );
