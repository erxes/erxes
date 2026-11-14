import {
  connectionSettings,
  type Db,
  newId,
  QUEUE_SCHEMA,
  type Transaction,
  withOrg,
} from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { fromDrizzle, PgBoss, type JobWithMetadata, type Queue } from 'pg-boss';
import { z } from 'zod';
import { inOrder } from '~/lib/sequence';
import { logger, traced } from '~/logger';

const log = logger.child({ component: 'jobs' });

/**
 * Background work runs on pg-boss (schema `core_queue`, installed by
 * `runMigrations`). pg-boss claims, retries with backoff, times out, keeps
 * failed jobs and runs the cron schedules; this module adds the tenant scope.
 * A job carries its organisation, `{ orgId, payload }`, and its handler runs
 * in `withOrg(orgId, ...)`. Jobs are added in the caller's transaction, so a
 * rollback drops them.
 */
let instance: PgBoss | null = null;

export const queue = () => {
  if (!instance) throw new Error('startJobs() must run before jobs are queued');

  return instance;
};

/** pg-boss's statements on the caller's transaction (enqueue, settle, retry in one commit). */
export const inTransaction = (client: Db) => ({ db: fromDrizzle(client, sql) });

/** Attempts in all; the first retry waits `delay` seconds, each next one twice as long (with jitter) up to `maxDelay`. */
interface Retry {
  attempts: number;
  delay: number;
  maxDelay: number;
}

/** 30 s, 1 min, 2 min … up to 6 hours: about four hours over 8 attempts. */
const DEFAULT_RETRY: Retry = { attempts: 8, delay: 30, maxDelay: 6 * 3600 };

/** A queue and what works it: what `startJobs` creates, schedules and runs. */
export interface JobQueue {
  name: string;
  options: Omit<Queue, 'name'>;
  /**
   * Jobs of this queue one process fetches and runs together. A full batch
   * fetches the next at once; a batch of one waits for the next poll, so a
   * queue that can back up wants at least 2.
   */
  concurrency: number;
  /** A cron schedule (UTC) that adds a job each time it comes due. */
  cron?: string;
  /** Throws to fail the attempt. */
  run: (job: JobWithMetadata<unknown>) => Promise<void>;
}

interface Job<P> {
  id: string;
  orgId: string;
  payload: P;
  /** 1 on the first try. */
  attempt: number;
  /** No retry follows when this attempt fails. */
  lastAttempt: boolean;
}

/**
 * `handle` throws to retry. An `atomic` job runs in the organisation's
 * transaction together with its completion: its writes and the job's end
 * commit as one. Any other job runs outside a transaction (HTTP calls), so it
 * must be idempotent: a job runs at least once.
 */
type Handler<P> =
  | { atomic: true; handle: (job: Job<P>, tx: Transaction) => Promise<void> }
  | { atomic?: false; handle: (job: Job<P>) => Promise<void> };

type Definition<P> = Handler<P> & {
  queue: string;
  /** Default: 8 attempts, 30 s first, up to 6 hours apart. */
  retry?: Partial<Retry>;
  /** Longest an attempt may run (seconds) before it counts as failed. Default 2 minutes. */
  timeoutSeconds?: number;
  concurrency?: number;
  /** After the last attempt failed, in the organisation's transaction (pg-boss's dead letter queue). */
  onDead?: (job: Job<P>, error: string, tx: Transaction) => Promise<void>;
};

export interface EnqueueInput {
  orgId: string;
  queue: string;
  payload: Record<string, unknown>;
  /** Run no earlier than this (delays, schedules). */
  runAt?: Date;
  /** One queued or running job per key: enqueueing it again adds nothing. */
  dedupeKey?: string;
}

/**
 * Adds jobs in the caller's transaction: they exist only if it commits.
 * Returns the ids of those added (a taken `dedupeKey` adds nothing).
 */
export const enqueueJobs = async (client: Db, inputs: EnqueueInput[]) => {
  const names = [...new Set(inputs.map((input) => input.queue))];

  const ids = await Promise.all(
    names.map((name) =>
      queue().insert(
        name,
        inputs
          .filter((input) => input.queue === name)
          .map((input) => ({
            data: { orgId: input.orgId, payload: input.payload },
            startAfter: input.runAt,
            // Exclusive queues allow one queued or running job per key.
            singletonKey: input.dedupeKey ?? newId(),
          })),
        { ...inTransaction(client), returnId: true },
      ),
    ),
  );

  return ids.flatMap((list) => list ?? []);
};

/** Adds one job; its id, or null when its `dedupeKey` is taken. */
export const enqueueJob = async (client: Db, input: EnqueueInput) =>
  (await enqueueJobs(client, [input]))[0] ?? null;

/** An error's message and up to three of its causes (Drizzle's "Failed query" hides why). */
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

/** What pg-boss stored for a failed attempt: the error we threw, serialized. */
const StoredError = z.object({ message: z.string() });

export const storedError = (output: unknown) =>
  StoredError.safeParse(output).data?.message ?? 'the attempt timed out or its worker stopped';

const queueOptions = (definition: { retry?: Partial<Retry>; timeoutSeconds?: number }) => {
  const retry = { ...DEFAULT_RETRY, ...definition.retry };

  return {
    policy: 'exclusive',
    notify: true,
    retryLimit: retry.attempts - 1,
    retryDelay: retry.delay,
    retryBackoff: true,
    retryDelayMax: retry.maxDelay,
    expireInSeconds: definition.timeoutSeconds ?? 120,
  } satisfies Omit<Queue, 'name'>;
};

/** What every job carries; `defineJob` parses the payload with its own schema. */
const Data = z.object({ orgId: z.string(), payload: z.unknown() });

/** Thrown in an atomic job's transaction when its attempt ended meanwhile: rolls its writes back. */
class AttemptEnded extends Error {
  constructor() {
    super('the attempt timed out and the job runs again');
  }
}

/**
 * A kind of background work. `payload` parses the job's payload for `handle`
 * and `onDead` (a payload that doesn't parse fails the attempt) and types
 * `enqueue`.
 */
export const defineJob = <S extends z.ZodType<Record<string, unknown>, Record<string, unknown>>>(
  definition: Definition<z.output<S>> & { payload: S },
) => {
  const { queue: name } = definition;
  const deadName = `${name}.dead`;

  const jobOf = (raw: JobWithMetadata<unknown>, retryCount = raw.retryCount) => {
    const data = Data.parse(raw.data);

    return {
      id: raw.id,
      orgId: data.orgId,
      payload: definition.payload.parse(data.payload),
      attempt: retryCount + 1,
      lastAttempt: retryCount >= raw.retryLimit,
    };
  };

  const handle = async (raw: JobWithMetadata<unknown>) => {
    const job = jobOf(raw);

    if (definition.atomic) {
      await withOrg(job.orgId, async (tx) => {
        await definition.handle(job, tx);

        const { affected } = await queue().complete(name, raw, null, inTransaction(tx));

        if (!affected) throw new AttemptEnded();
      });
    } else {
      await definition.handle(job);
    }
  };

  const { onDead } = definition;

  const queues: JobQueue[] = [
    ...(onDead
      ? [
          {
            name: deadName,
            options: queueOptions({ retry: { attempts: 3, delay: 30, maxDelay: 300 } }),
            concurrency: 1,
            run: (raw: JobWithMetadata<unknown>) =>
              traced(`job ${deadName}`, async () => {
                const job = jobOf(raw, raw.sourceRetryCount ?? raw.retryLimit);

                await withOrg(job.orgId, (tx) => onDead(job, storedError(raw.sourceOutput), tx));
              }),
          },
        ]
      : []),
    {
      name,
      options: { ...queueOptions(definition), ...(onDead ? { deadLetter: deadName } : {}) },
      concurrency: definition.concurrency ?? 2,
      run: (raw: JobWithMetadata<unknown>) => traced(`job ${name}`, () => handle(raw)),
    },
  ];

  type Input = Omit<EnqueueInput, 'queue' | 'payload'> & { payload: z.input<S> };

  return {
    queue: name,
    queues,
    enqueue: (client: Db, input: Input) => enqueueJob(client, { ...input, queue: name }),
    /** Many in one insert. */
    enqueueAll: (client: Db, inputs: Input[]) =>
      enqueueJobs(
        client,
        inputs.map((input) => ({ ...input, queue: name })),
      ),
  };
};

/**
 * Work across organisations on a cron schedule (UTC): one job per occurrence
 * for the whole deployment, run in its own trace. A failure retries once a
 * minute, up to three times; the next occurrence starts over.
 */
export const defineSchedule = (definition: {
  queue: string;
  cron: string;
  timeoutSeconds?: number;
  run: () => Promise<unknown>;
}) => ({
  queues: [
    {
      name: definition.queue,
      options: queueOptions({
        retry: { attempts: 3, delay: 60, maxDelay: 60 },
        timeoutSeconds: definition.timeoutSeconds,
      }),
      concurrency: 1,
      cron: definition.cron,
      run: async () => {
        await traced(definition.queue, definition.run);
      },
    } satisfies JobQueue,
  ],
});

const registered = new Map<string, JobQueue>();

/** Creates the queues (or brings their settings up to date) and their schedules. */
export const addQueues = async (list: JobQueue[], { schedule }: { schedule: boolean }) => {
  const boss = queue();

  // In order: a dead letter queue comes before the queue that names it.
  await inOrder(list, async ({ name, options }) => {
    await boss.createQueue(name, options);

    // createQueue leaves an existing queue alone; its policy never changes.
    const { policy: _policy, ...settings } = options;

    await boss.updateQueue(name, settings);
  });

  for (const item of list) registered.set(item.name, item);

  if (schedule)
    await Promise.all(
      list.flatMap(({ name, cron }) =>
        cron ? [boss.schedule(name, cron, null, { tz: 'UTC' })] : [],
      ),
    );
};

/** Runs one job: its outcome for pg-boss, the error stored as its output (the failures list shows it). */
const settle = async (name: string, run: JobQueue['run'], job: JobWithMetadata<unknown>) => {
  try {
    await run(job);

    return { id: job.id, status: 'completed' as const };
  } catch (error) {
    const facts = { queue: name, job: job.id, attempt: job.retryCount + 1, err: error };

    if (job.retryCount >= job.retryLimit) log.error(facts, 'job gave up');
    else log.warn(facts, 'job failed; retrying');

    return { id: job.id, status: 'failed' as const, output: { message: describeError(error) } };
  }
};

/**
 * Starts a worker for every queue: it fetches up to `concurrency` jobs, runs
 * them together and settles each on its own. NOTIFY wakes it when a job is
 * added; jobs that come due later (delays, retries) wait for its 5 s poll.
 * `stopWorkers` waits for the jobs in progress.
 */
export const startWorkers = async () => {
  const boss = queue();

  await Promise.all(
    [...registered.values()].map(({ name, concurrency, run }) =>
      boss.work(
        name,
        {
          includeMetadata: true,
          batchSize: concurrency,
          perJobResults: true,
          burstWhenBatchFull: true,
          notifyPollingIntervalSeconds: 5,
        },
        (jobs) => Promise.all(jobs.map((job) => settle(name, run, job))),
      ),
    ),
  );
};

export const stopWorkers = () =>
  Promise.all([...registered.keys()].map((name) => queue().offWork(name, { wait: true })));

/**
 * Connects to the queue and creates every queue. `work` also runs them and
 * their schedules (the API server); without it, only enqueueing works
 * (scripts, tests until they settle).
 */
export const startJobs = async (list: JobQueue[], { work }: { work: boolean }) => {
  const next = new PgBoss({
    ...connectionSettings(),
    application_name: 'erxes-core-jobs',
    max: work ? 5 : 2,
    schema: QUEUE_SCHEMA,
    // `pnpm db:migrate` (runMigrations) installs and upgrades the schema as the owner.
    migrate: false,
    supervise: work,
    schedule: work,
    // Wakes workers when a job is added (tests start theirs later, in settle()).
    useListenNotify: true,
    // These create tables or rebuild indexes, which the runtime role may not.
    persistQueueStats: false,
    reindex: false,
  });

  next.on('error', (error) => log.error({ err: error }, 'job queue error'));
  next.on('warning', (warning) => log.warn({ warning }, 'job queue warning'));

  await next.start();
  instance = next;
  await addQueues(list, { schedule: work });

  if (work) await startWorkers();
};

/** Stops the workers after the jobs in progress (up to 30 s), then disconnects. */
export const stopJobs = async () => {
  const current = instance;

  instance = null;
  registered.clear();
  await current?.stop({ graceful: true, timeout: 30_000 });
};
