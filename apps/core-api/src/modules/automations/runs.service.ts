import type { AutomationRun, CursorQuery, RunStep } from '@erxes/core-contract';
import { automationRuns, automationRunSteps, type Db } from '@erxes/core-db';
import { and, asc, eq, inArray, isNotNull, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { type Actor, userCaller } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { keysetPage } from '~/lib/keyset';
import { recordAudit } from '~/modules/audit/audit.service';
import { findAutomation } from './automations.service';
import { cancelRun, definitionOf, retryRun } from './runs';
import { startNow } from './triggers';

type RunRow = typeof automationRuns.$inferSelect;

const toRunDto = (row: RunRow): AutomationRun => ({
  id: row.id,
  automationId: row.automationId,
  version: row.version,
  eventId: row.eventId,
  eventType: row.eventType,
  subject: row.subjectType && row.subjectId ? { type: row.subjectType, id: row.subjectId } : null,
  status: row.status,
  goalReached: Boolean(row.goalReachedAt),
  error: row.error,
  waitingUntil: row.waitingUntil?.toISOString() ?? null,
  startedAt: row.startedAt.toISOString(),
  finishedAt: row.finishedAt?.toISOString() ?? null,
});

export const listRuns = async (
  client: Db,
  actor: Actor,
  query: CursorQuery & { id: string; status?: RunRow['status'] },
) => {
  await findAutomation(client, actor.orgId, query.id);

  const page = await keysetPage(
    client,
    {
      table: automationRuns,
      id: automationRuns.id,
      createdAt: automationRuns.startedAt,
      scope: sql`${eq(automationRuns.orgId, actor.orgId)} and ${eq(automationRuns.automationId, query.id)}`,
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

const findRun = async (client: Db, orgId: string, runId: string) => {
  const [row] = await client
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.orgId, orgId), eq(automationRuns.id, runId)))
    .limit(1);

  if (!row) throw notFound('Run');

  return row;
};

export const getRun = async (client: Db, actor: Actor, runId: string) => {
  const run = await findRun(client, actor.orgId, runId);

  const steps = await client
    .select()
    .from(automationRunSteps)
    .where(and(eq(automationRunSteps.orgId, actor.orgId), eq(automationRunSteps.runId, runId)))
    .orderBy(asc(automationRunSteps.finishedAt));

  return {
    run: toRunDto(run),
    steps: steps.map((step): RunStep => ({
      id: step.id,
      stepId: step.stepId,
      type: step.type,
      status: step.status,
      input: step.input,
      output: step.output,
      error: step.error,
      attempt: step.attempt,
      startedAt: step.startedAt.toISOString(),
      finishedAt: step.finishedAt.toISOString(),
    })),
  };
};

export const retryAutomationRun = async (client: Db, actor: Actor, runId: string) => {
  await findRun(client, actor.orgId, runId);

  const run = await retryRun(client, actor.orgId, runId);

  if (!run) throw new HttpError(409, 'NOT_FAILED', 'Only a failed run can be retried');

  return toRunDto(run);
};

export const cancelAutomationRun = async (client: Db, actor: Actor, runId: string) => {
  await findRun(client, actor.orgId, runId);

  const run = await cancelRun(client, actor.orgId, runId);

  if (!run)
    throw new HttpError(409, 'NOT_RUNNING', 'Only a running or waiting run can be cancelled');

  return toRunDto(run);
};

/** A member starts an active automation now, on the given records or its audience. */
export const startAutomation = async (
  client: Db,
  actor: Actor,
  id: string,
  subjects?: string[],
) => {
  const row = await findAutomation(client, actor.orgId, id);

  const definition =
    row.status === 'active' && row.activeVersion
      ? await definitionOf(client, id, row.activeVersion)
      : null;

  if (!definition) throw new HttpError(409, 'NOT_ACTIVE', 'Turn the automation on first');

  const result = await startNow(client, row, definition, subjects);

  await recordAudit(client, userCaller(actor), {
    action: 'automation.started',
    targetType: 'automation',
    targetId: id,
    targetLabel: row.name,
    metadata: result,
  });

  return result;
};

/** Runs skipped by the hourly limit, counted in the automation's working state. */
const SkippedByLimit = z
  .object({ skippedByLimit: z.number().int().default(0) })
  .catch({ skippedByLimit: 0 });

const countWhere = (filter: SQL | undefined) => sql<number>`count(*) filter (where ${filter})::int`;

/** The last 30 days: runs by outcome and each step's results. */
export const automationStats = async (client: Db, actor: Actor, id: string) => {
  const row = await findAutomation(client, actor.orgId, id);

  const recent = and(
    eq(automationRuns.orgId, actor.orgId),
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
    skippedByLimit: SkippedByLimit.parse(row.state).skippedByLimit,
  };
};
