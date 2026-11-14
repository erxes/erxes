import type { CursorQuery } from '@erxes/core-contract';
import { automationRuns, automationRunSteps, type Db } from '@erxes/core-db';
import { FINISHED_RUN_STATUSES } from '@erxes/core-db/enums';
import { and, asc, eq, inArray, isNotNull, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { HttpError, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { recordAudit } from '~/modules/audit/audit.service';
import { findAutomation } from './automations.service';
import { cancelRun, definitionOf, retryRun } from './runs';
import { startNow } from './triggers';

type RunRow = typeof automationRuns.$inferSelect;

const toRunDto = (row: RunRow) => ({
  ...row,
  subject: row.subjectType && row.subjectId ? { type: row.subjectType, id: row.subjectId } : null,
  goalReached: Boolean(row.goalReachedAt),
});

export const listRuns = async (
  client: Db,
  query: CursorQuery & { id: string; status?: RunRow['status'] },
) => {
  await findAutomation(client, query.id);

  const page = await keysetPage(
    client,
    {
      table: automationRuns,
      id: automationRuns.id,
      createdAt: automationRuns.startedAt,
      scope: eq(automationRuns.automationId, query.id),
      countCap: 10_000,
    },
    query.status ? eq(automationRuns.status, query.status) : undefined,
    query,
    (where, orderBy, limit) =>
      client
        .select()
        .from(automationRuns)
        .where(where)
        .orderBy(...orderBy)
        .limit(limit),
  );

  return { ...page, data: page.data.map(toRunDto) };
};

const findRun = async (client: Db, runId: string) => {
  const [row] = await client
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.id, runId))
    .limit(1);

  if (!row) throw notFound('Run');

  return row;
};

export const getRun = async (client: Db, runId: string) => {
  const run = await findRun(client, runId);

  const steps = await client
    .select()
    .from(automationRunSteps)
    .where(eq(automationRunSteps.runId, runId))
    .orderBy(asc(automationRunSteps.finishedAt));

  return {
    run: toRunDto(run),
    steps,
  };
};

export const retryAutomationRun = async (client: Db, runId: string) => {
  await findRun(client, runId);

  const run = await retryRun(client, runId);

  if (!run) throw new HttpError(409, 'NOT_FAILED', 'Only a failed run can be retried');

  return toRunDto(run);
};

export const cancelAutomationRun = async (client: Db, runId: string) => {
  await findRun(client, runId);

  const run = await cancelRun(client, runId);

  if (!run)
    throw new HttpError(409, 'NOT_RUNNING', 'Only a running or waiting run can be cancelled');

  return toRunDto(run);
};

/** A member starts an active automation now, on the given records or its audience. */
export const startAutomation = async (client: Db, id: string, subjects?: string[]) => {
  const row = await findAutomation(client, id);

  const definition =
    row.status === 'active' && row.activeVersion
      ? await definitionOf(client, id, row.activeVersion)
      : null;

  if (!definition) throw new HttpError(409, 'NOT_ACTIVE', 'Turn the automation on first');

  const result = await startNow(client, row, definition, subjects);

  await recordAudit(client, {
    action: 'automation.started',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
    metadata: result,
  });

  return result;
};

/** Runs skipped by the hourly limit, counted in the automation's working state. */
const SkippedByLimit = z.object({ skippedByLimit: z.int() });

const countWhere = (filter: SQL | undefined) => sql<number>`count(*) filter (where ${filter})::int`;

/** The last 30 days: runs by outcome and each step's results. */
export const automationStats = async (client: Db, id: string) => {
  const row = await findAutomation(client, id);

  const recent = and(
    eq(automationRuns.automationId, id),
    sql`${automationRuns.startedAt} > now() - interval '30 days'`,
  );

  const [runs] = await client
    .select({
      total: sql<number>`count(*)::int`,
      running: countWhere(inArray(automationRuns.status, ['running', 'waiting'])),
      succeeded: countWhere(eq(automationRuns.status, 'succeeded')),
      failed: countWhere(eq(automationRuns.status, 'failed')),
      cancelled: countWhere(eq(automationRuns.status, 'cancelled')),
      goalReached: countWhere(isNotNull(automationRuns.goalReachedAt)),
    })
    .from(automationRuns)
    .where(recent);

  const steps = await client
    .select({
      stepId: automationRunSteps.stepId,
      succeeded: countWhere(eq(automationRunSteps.status, 'succeeded')),
      failed: countWhere(eq(automationRunSteps.status, 'failed')),
      skipped: countWhere(eq(automationRunSteps.status, 'skipped')),
    })
    .from(automationRunSteps)
    .innerJoin(automationRuns, eq(automationRuns.id, automationRunSteps.runId))
    .where(recent)
    .groupBy(automationRunSteps.stepId);

  return {
    runs: runs ?? { total: 0, running: 0, succeeded: 0, failed: 0, cancelled: 0, goalReached: 0 },
    steps,
    skippedByLimit: SkippedByLimit.safeParse(row.state).data?.skippedByLimit ?? 0,
  };
};

/**
 * Runs that finished more than `days` ago lose their step log and context,
 * most of their size. The run row stays: re-entry rules and the run list
 * read it. A thousand runs per pass, so a pass never holds locks for long.
 */
export const pruneRunDetails = async (client: Db, days: number) => {
  const result = await client.execute(sql`
    with old as (
      select r.id from ${automationRuns} r
      where r.status in ${FINISHED_RUN_STATUSES}
        and r.context <> '{}'::jsonb
        and r.finished_at < now() - make_interval(days => ${days})
      limit 1000
    ),
    steps as (delete from ${automationRunSteps} s using old where s.run_id = old.id)
    update ${automationRuns} r set context = '{}'::jsonb from old where r.id = old.id
  `);

  return result.rowCount ?? 0;
};
