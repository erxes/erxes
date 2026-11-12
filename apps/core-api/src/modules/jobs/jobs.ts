import { type Db, jobs, newId, type Transaction, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { log } from '~/lib/log';
import { liveHub } from '~/modules/live/hub';

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
export const defineJob = <S extends z.ZodType<Record<string, unknown>>>(
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
export const defaultBackoff = (attempt: number) =>
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

/** Claims due jobs (and ones whose worker died) for these queues. */
const claim = (queues: Map<string, JobDefinition>, limit: number) =>
  withSystem('jobs: claim', async (tx) => {
    const definitions = [...queues.values()];

    const result = await tx.execute<{ id: string }>(sql`
      update ${jobs} j set
        status = 'running',
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
        where queue in (${sql.join(
          definitions.map((definition) => sql`${definition.queue}`),
          sql`, `,
        )})
          and ((status = 'queued' and run_at <= now()) or (status = 'running' and locked_until < now()))
        order by run_at
        limit ${limit}
        for update skip locked
      )
      returning j.id
    `);

    if (!result.rows.length) return [];

    return tx
      .select()
      .from(jobs)
      .where(
        sql`${jobs.id} in (${sql.join(
          result.rows.map((row) => sql`${row.id}`),
          sql`, `,
        )})`,
      );
  });

const fail = async (definition: JobDefinition, job: JobRow, error: unknown) => {
  const message = describeError(error);
  const dead = job.attempts >= job.maxAttempts;
  const delay = (definition.backoff ?? defaultBackoff)(job.attempts);

  if (dead)
    log.error('job gave up', {
      queue: job.queue,
      job: job.id,
      attempts: job.attempts,
      error: message,
    });
  else
    log.warn('job failed; retrying', {
      queue: job.queue,
      job: job.id,
      attempt: job.attempts,
      error: message,
    });

  await withOrg(job.orgId, (tx) =>
    tx
      .update(jobs)
      .set({
        status: dead ? 'dead' : 'queued',
        runAt: dead ? sql`${jobs.runAt}` : sql`now() + make_interval(secs => ${delay})`,
        lockedUntil: null,
        lastError: message,
        updatedAt: sql`now()`,
      })
      .where(and(eq(jobs.id, job.id), eq(jobs.status, 'running'))),
  );

  const { onDead } = definition;

  if (dead && onDead) {
    await withOrg(job.orgId, (tx) => onDead(job, message, tx)).catch((hookError: unknown) =>
      log.error('job onDead failed', { queue: job.queue, job: job.id, error: hookError }),
    );
  }
};

/** Runs one claimed job to completion, retry or death. */
export const runJob = async (definition: JobDefinition, job: JobRow) => {
  try {
    if (definition.atomic) {
      await withOrg(job.orgId, async (tx) => {
        await definition.handle(job, tx);
        await tx.delete(jobs).where(eq(jobs.id, job.id));
      });
    } else {
      await definition.handle(job);
      await withOrg(job.orgId, (tx) => tx.delete(jobs).where(eq(jobs.id, job.id)));
    }
  } catch (error) {
    await fail(definition, job, error);
  }
};

/** Claims and runs due jobs until none are left (tests, and each tick). */
export const processJobs = async (definitions: JobDefinition[], concurrency = 5) => {
  const queues = new Map(definitions.map((definition) => [definition.queue, definition]));
  let handled = 0;

  for (let round = 0; round < 100; round += 1) {
    const claimed = await claim(queues, concurrency);

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
      .catch((error: unknown) => log.error('job processing failed', { error }))
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
