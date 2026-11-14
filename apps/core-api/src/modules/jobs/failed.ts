import { type Db, QUEUE_SCHEMA, scopedOrgId } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { inTransaction, queue } from './jobs';

/**
 * Jobs that failed: waiting for a retry, or failed for good after the last
 * attempt. pg-boss keeps them in its job table; this reads them for the
 * failures pages and retries or removes them through pg-boss.
 */
const FAILED_STATES = ['retry', 'failed'] as const;

type FailedState = (typeof FAILED_STATES)[number];

const FailedJob = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(FAILED_STATES),
  key: z.string(),
  attempts: z.number(),
  output: z.unknown(),
  failedAt: z.date(),
  nextAttemptAt: z.date().nullable(),
});

export type FailedJob = z.infer<typeof FailedJob>;

interface FailedQuery {
  state?: FailedState;
  /** Picks jobs by queue and dedupe key. */
  refs?: { name: string; key: string }[];
}

/**
 * The scope's organisation's failed jobs in queues named `prefix…`. pg-boss's
 * tables have no row level security, so this selects by the scope's
 * organisation.
 */
const failedWhere = (prefix: string, query: FailedQuery) => {
  const orgId = scopedOrgId();

  if (!orgId) throw new Error('failed jobs are read in an organisation scope');

  const states = query.state ? [query.state] : FAILED_STATES;

  return sql.join(
    [
      sql`name like ${`${prefix}%`}`,
      sql`data->>'orgId' = ${orgId}`,
      sql`state::text in (${sql.join(
        states.map((state) => sql`${state}`),
        sql`, `,
      )})`,
      ...(query.refs
        ? [
            sql`(name, singleton_key) in (${sql.join(
              query.refs.map((ref) => sql`(${ref.name}, ${ref.key})`),
              sql`, `,
            )})`,
          ]
        : []),
    ],
    sql` and `,
  );
};

const jobTable = sql`${sql.identifier(QUEUE_SCHEMA)}.job`;

/** Failed jobs, most recently failed first. */
export const failedJobs = async (
  client: Db,
  prefix: string,
  query: FailedQuery & { limit: number },
) => {
  const failedAt: SQL = sql`coalesce(completed_on, started_on, created_on)`;

  const result = await client.execute(sql`
    select id::text, name, state::text, singleton_key as key, retry_count + 1 as attempts, output,
      ${failedAt} as "failedAt",
      case when state = 'retry' then start_after end as "nextAttemptAt"
    from ${jobTable}
    where ${failedWhere(prefix, query)}
    order by ${failedAt} desc
    limit ${query.limit}
  `);

  return FailedJob.array().parse(result.rows);
};

/** How many jobs wait for a retry and how many failed for good. */
export const failedJobCounts = async (client: Db, prefix: string) => {
  const result = await client.execute(sql`
    select state::text, count(*)::int as count from ${jobTable}
    where ${failedWhere(prefix, {})}
    group by state
  `);

  const rows = z
    .array(z.object({ state: z.enum(FAILED_STATES), count: z.number() }))
    .parse(result.rows);

  return {
    retry: rows.find((row) => row.state === 'retry')?.count ?? 0,
    failed: rows.find((row) => row.state === 'failed')?.count ?? 0,
  };
};

const idsByQueue = (list: FailedJob[]) =>
  [...new Set(list.map((job) => job.name))].map(
    (name) => [name, list.filter((job) => job.name === name).map((job) => job.id)] as const,
  );

/**
 * Tries them again now, in the caller's transaction: a failed job gets one
 * more attempt, one waiting for its retry stops waiting.
 */
export const retryJobs = (client: Db, list: FailedJob[]) =>
  Promise.all([
    ...idsByQueue(list.filter((job) => job.state === 'failed')).map(([name, ids]) =>
      queue().retry(name, ids, inTransaction(client)),
    ),
    ...list
      .filter((job) => job.state === 'retry')
      .map((job) =>
        queue().update(job.name, undefined, {
          id: job.id,
          startAfter: new Date(),
          ...inTransaction(client),
        }),
      ),
  ]);

/** Gives up on them: they are removed, in the caller's transaction. */
export const deleteJobs = (client: Db, list: FailedJob[]) =>
  Promise.all(
    idsByQueue(list).map(([name, ids]) => queue().deleteJob(name, ids, inTransaction(client))),
  );
