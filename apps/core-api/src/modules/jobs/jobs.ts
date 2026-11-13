import {
  type Db,
  type JobStatus,
  jobs,
  newId,
  type Transaction,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, gte, inArray, lt, lte, or, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { logger, traced } from '~/logger';
import { liveHub } from '~/modules/live/hub';

const log = logger.child({ component: 'jobs' });

export type JobRow = typeof jobs.$inferSelect;

interface JobOptions {
  queue: string;
  /** How long a worker may hold the job before another takes it (seconds). */
  leaseSeconds?: number;
  /** Seconds to wait before attempt `attempt + 1`. */
  backoff?: (attempt: number) => number;
}

/**
 * A kind of background work. `handle` throws to retry. An `atomic` job runs in
 * the organisation's transaction together with marking it done (its database
 * effects and the completion commit as one). Any other job runs outside a
 * transaction (HTTP calls) and must be idempotent: a job is delivered at least once.
 */
type Handler<J> =
  | { atomic: true; handle: (job: J, tx: Transaction) => Promise<void> }
  | { atomic?: false; handle: (job: J) => Promise<void> };

interface DeadHook<J> {
  /** After the last attempt failed (in the organisation's own transaction). */
  onDead?: (job: J, error: string, tx: Transaction) => Promise<void>;
}

export type JobDefinition = JobOptions & Handler<JobRow> & DeadHook<JobRow>;

export interface EnqueueInput {
  orgId: string;
  queue: string;
  payload?: Record<string, unknown>;
  /** Run no earlier than this (delays, schedules). */
  runAt?: Date;
  /** Only one queued job per key: enqueueing again does nothing. */
  dedupeKey?: string;
  maxAttempts?: number;
}

/** Adds a job in the caller's transaction: it exists only if that commits. */
export const enqueueJob = async (client: Db, input: EnqueueInput): Promise<string | null> => {
  const [row] = await client
    .insert(jobs)
    .values({
      id: newId(),
      orgId: input.orgId,
      queue: input.queue,
      payload: input.payload ?? {},
      runAt: input.runAt ?? sql`now()`,
      dedupeKey: input.dedupeKey ?? null,
      maxAttempts: input.maxAttempts ?? 8,
    })
    .onConflictDoNothing()
    .returning({ id: jobs.id });

  return row?.id ?? null;
};

type PayloadJob<P> = Omit<JobRow, 'payload'> & { payload: P };

/**
 * A job whose payload `handle` and `onDead` get parsed by `payload` (a payload
 * that doesn't parse fails the attempt), with `enqueue` typed to match.
 */
export const defineJob = <S extends z.ZodType<Record<string, unknown>, Record<string, unknown>>>(
  definition: JobOptions & { payload: S } & Handler<PayloadJob<z.output<S>>> &
    DeadHook<PayloadJob<z.output<S>>>,
) => {
  const { payload: schema, onDead } = definition;
  const parsed = (row: JobRow) => ({ ...row, payload: schema.parse(row.payload) });

  const options = {
    queue: definition.queue,
    leaseSeconds: definition.leaseSeconds,
    backoff: definition.backoff,
    onDead:
      onDead && ((row: JobRow, error: string, tx: Transaction) => onDead(parsed(row), error, tx)),
  };

  const job: JobDefinition = definition.atomic
    ? { ...options, atomic: true, handle: (row, tx) => definition.handle(parsed(row), tx) }
    : { ...options, handle: (row) => definition.handle(parsed(row)) };

  return {
    ...job,
    enqueue: (
      client: Db,
      input: Omit<EnqueueInput, 'queue' | 'payload'> & { payload: z.input<S> },
    ) => enqueueJob(client, { ...input, queue: definition.queue }),
  };
};

/** 30 s, 2 min, 8 min … capped at 6 hours, with jitter. */
const defaultBackoff = (attempt: number) =>
  Math.min(6 * 3600, 30 * 4 ** (attempt - 1)) * (0.8 + Math.random() * 0.4);

/** An error's message and up to three of its causes, for `lastError` columns. */
export const describeError = (error: unknown) => {
  const parts: string[] = [];
  let current = error;

  for (let depth = 0; current && depth < 4; depth += 1) {
    if (current instanceof Error) {
      parts.push(current.message);
      current = current.cause;
    } else {
      parts.push(typeof current === 'string' ? current : JSON.stringify(current));
      current = undefined;
    }
  }

  return parts.join(' — ').slice(0, 2000);
};

/** Why a job whose worker stopped during its last attempt is dead. */
const LEASE_RAN_OUT = 'the worker stopped or timed out during the last attempt';

/**
 * Claims due jobs (and ones whose worker died) for these queues. A job whose
 * lease ran out on its last attempt is not claimed again: it is dead, and
 * returned as `abandoned` so its `onDead` runs.
 */
const claim = (queues: Map<string, JobDefinition>, limit: number) =>
  withSystem('jobs: claim', async (tx) => {
    const definitions = [...queues.values()];

    const inQueues = inArray(
      jobs.queue,
      definitions.map((definition) => definition.queue),
    );

    const leaseRanOut = and(eq(jobs.status, 'running'), lt(jobs.lockedUntil, sql`now()`));

    const abandoned = await tx
      .update(jobs)
      .set({ status: 'dead', lockedUntil: null, lastError: LEASE_RAN_OUT, updatedAt: sql`now()` })
      .where(and(inQueues, leaseRanOut, gte(jobs.attempts, jobs.maxAttempts)))
      .returning();

    const result = await tx.execute<{ id: string }>(sql`
      update ${jobs} j set
        status = ${'running' satisfies JobStatus},
        attempts = j.attempts + 1,
        locked_until = now() + make_interval(secs => case j.queue
          ${sql.join(
            definitions.map(
              (definition) => sql`when ${definition.queue} then ${definition.leaseSeconds ?? 120}`,
            ),
            sql` `,
          )} else 120 end),
        updated_at = now()
      where j.id in (
        select id from ${jobs}
        where ${and(inQueues, or(and(eq(jobs.status, 'queued'), lte(jobs.runAt, sql`now()`)), leaseRanOut))}
        order by run_at
        limit ${limit}
        for update skip locked
      )
      returning j.id
    `);

    if (!result.rows.length) return { claimed: [], abandoned };

    const claimed = await tx
      .select()
      .from(jobs)
      .where(
        sql`${jobs.id} in (${sql.join(
          result.rows.map((row) => sql`${row.id}`),
          sql`, `,
        )})`,
      );

    return { claimed, abandoned };
  });

/** Runs a dead job's `onDead` in its organisation's transaction; a failing hook is logged. */
const runOnDead = (definition: JobDefinition, job: JobRow, message: string) => {
  const { onDead } = definition;

  if (!onDead) return Promise.resolve();

  return withOrg(job.orgId, (tx) => onDead(job, message, tx)).catch((hookError: unknown) =>
    log.error({ queue: job.queue, job: job.id, err: hookError }, 'job onDead failed'),
  );
};

/**
 * Only the worker holding the job's latest claim may finish it: a worker whose
 * lease ran out and was claimed again by another one changes nothing.
 */
const heldBy = (job: JobRow) =>
  and(eq(jobs.id, job.id), eq(jobs.status, 'running'), eq(jobs.attempts, job.attempts));

const fail = async (definition: JobDefinition, job: JobRow, error: unknown) => {
  const message = describeError(error);
  const dead = job.attempts >= job.maxAttempts;
  const delay = (definition.backoff ?? defaultBackoff)(job.attempts);
  const facts = { queue: job.queue, job: job.id, attempt: job.attempts, err: message };

  const updated = await withOrg(job.orgId, (tx) =>
    tx
      .update(jobs)
      .set({
        status: dead ? 'dead' : 'queued',
        runAt: dead ? sql`${jobs.runAt}` : sql`now() + make_interval(secs => ${delay})`,
        lockedUntil: null,
        lastError: message,
        updatedAt: sql`now()`,
      })
      .where(heldBy(job))
      .returning({ id: jobs.id }),
  );

  if (!updated.length) {
    log.warn(facts, 'job failed after another worker claimed it; that worker decides');
  } else if (dead) {
    log.error(facts, 'job gave up');
    await runOnDead(definition, job, message);
  } else {
    log.warn(facts, 'job failed; retrying');
  }
};

/** Thrown in an atomic job's transaction when another worker holds the job now. */
class LeaseLost extends Error {
  constructor() {
    super('the lease ran out and another worker claimed the job');
  }
}

/** Runs one claimed job to completion, retry or death, in a trace of its own. */
const runJob = (definition: JobDefinition, job: JobRow) =>
  traced(`job ${job.queue}`, async () => {
    try {
      if (definition.atomic) {
        await withOrg(job.orgId, async (tx) => {
          await definition.handle(job, tx);

          const done = await tx.delete(jobs).where(heldBy(job)).returning({ id: jobs.id });

          // Rolls the job's writes back: the worker that holds it now commits them.
          if (!done.length) throw new LeaseLost();
        });
      } else {
        await definition.handle(job);
        await withOrg(job.orgId, (tx) => tx.delete(jobs).where(heldBy(job)));
      }
    } catch (error) {
      await fail(definition, job, error);
    }
  });

/** Claims and runs due jobs until none are left (tests, and each tick). */
export const processJobs = async (definitions: JobDefinition[], concurrency = 5) => {
  const queues = new Map(definitions.map((definition) => [definition.queue, definition]));
  let handled = 0;

  for (let round = 0; round < 100; round += 1) {
    const { claimed, abandoned } = await claim(queues, concurrency);

    for (const job of abandoned) {
      const definition = queues.get(job.queue);

      log.error({ queue: job.queue, job: job.id, attempts: job.attempts }, 'job gave up');

      if (definition) await runOnDead(definition, job, LEASE_RAN_OUT);
    }

    if (!claimed.length) break;

    await Promise.all(
      claimed.flatMap((job) => {
        const definition = queues.get(job.queue);

        return definition ? [runJob(definition, job)] : [];
      }),
    );
    handled += claimed.length;
  }

  return handled;
};

/** Runs jobs as they are enqueued (LISTEN) and as delays come due (every 2 s). */
export const startJobWorker = (definitions: JobDefinition[], concurrency = 5) => {
  let current: Promise<void> | null = null;
  let again = false;
  let stopped = false;

  const run = () => {
    if (stopped) return;

    if (current) {
      again = true;

      return;
    }

    current = processJobs(definitions, concurrency)
      .then(() => undefined)
      .catch((error: unknown) => log.error({ err: error }, 'job processing failed'))
      .finally(() => {
        current = null;

        if (again) {
          again = false;
          run();
        }
      });
  };

  const timer = setInterval(run, 2000);

  timer.unref();
  liveHub.on('jobs', run);
  run();

  return async () => {
    stopped = true;
    clearInterval(timer);
    liveHub.off('jobs', run);
    await current;
  };
};

/** Dead jobs back to the queue (one more attempt each). */
export const retryDeadJobs = (client: Db, orgId: string, ids: string[]) =>
  client
    .update(jobs)
    .set({
      status: 'queued',
      runAt: sql`now()`,
      maxAttempts: sql`${jobs.attempts} + 1`,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(jobs.orgId, orgId),
        eq(jobs.status, 'dead'),
        sql`${jobs.id} in (${sql.join(
          ids.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      ),
    )
    .returning({ id: jobs.id });
