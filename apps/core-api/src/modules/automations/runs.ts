import type { FINISHED_RUN_STATUSES } from '@erxes/core-db/enums';
import { AutomationDefinition, type AutomationStep } from '@erxes/core-contract';
import {
  automationRuns,
  automationRunSteps,
  automations,
  automationVersions,
  type ContentType,
  type Db,
  newId,
  roles,
  users,
} from '@erxes/core-db';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { type Actor, systemCaller } from '~/http/auth';
import { logger } from '~/logger';
import { enqueueJob } from '~/modules/jobs/jobs';
import { notify } from '~/modules/notifications/notifications.service';
import { type Cursor, sameCursor, stepAt } from './cursor';

export const log = logger.child({ component: 'automations' });

export type RunRow = typeof automationRuns.$inferSelect;

export type RunContext = Record<string, unknown>;

export type SubjectRef = { type: ContentType; id: string };

export const subjectRefOf = (run: Pick<RunRow, 'subjectType' | 'subjectId'>): SubjectRef | null =>
  run.subjectType && run.subjectId ? { type: run.subjectType, id: run.subjectId } : null;

type VersionRef = { automationId: string; version: number };

/** The definitions of these automation versions in one query; look one up with `get(automationId, version)`. */
export const definitionsOf = async (tx: Db, versions: VersionRef[]) => {
  const rows = versions.length
    ? await tx
        .select({
          automationId: automationVersions.automationId,
          version: automationVersions.version,
          definition: automationVersions.definition,
        })
        .from(automationVersions)
        .where(
          or(
            ...versions.map((ref) =>
              and(
                eq(automationVersions.automationId, ref.automationId),
                eq(automationVersions.version, ref.version),
              ),
            ),
          ),
        )
    : [];

  const byVersion = new Map(
    rows.map((row) => [
      `${row.automationId}@${row.version}`,
      AutomationDefinition.parse(row.definition),
    ]),
  );

  return {
    get: (automationId: string, version: number) =>
      byVersion.get(`${automationId}@${version}`) ?? null,
  };
};

export const definitionOf = async (tx: Db, automationId: string, version: number) =>
  (await definitionsOf(tx, [{ automationId, version }])).get(automationId, version);

/**
 * The member an automation acts as, with their role's permissions read now:
 * a member who was disabled or lost a permission can't keep acting through it.
 */
export const actorOf = async (tx: Db, orgId: string, userId: string | null): Promise<Actor> => {
  if (!userId) throw new Error('Nobody turned this automation on');

  const [row] = await tx
    .select({
      id: users.id,
      role: users.role,
      status: users.status,
      permissions: roles.permissions,
    })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(eq(users.id, userId))
    .limit(1);

  if (row?.status !== 'active')
    throw new Error('The member who turned this automation on is no longer active');

  return { userId: row.id, orgId, role: row.role, permissions: row.permissions };
};

export const RunPayload = z.object({ runId: z.string() });

/** One run's row, locked for this transaction, if it is still in progress. */
export const lockLiveRun = async (tx: Db, runId: string) => {
  const [run] = await tx
    .select()
    .from(automationRuns)
    .where(eq(automationRuns.id, runId))
    .for('update')
    .limit(1);

  return run && (run.status === 'running' || run.status === 'waiting') ? run : null;
};

type StepEntry = {
  status: 'succeeded' | 'failed';
  input?: unknown;
  output?: unknown;
  error?: string;
  attempt: number;
  startedAt: Date;
};

const logStep = (tx: Db, run: RunRow, step: AutomationStep, entry: StepEntry) =>
  tx.insert(automationRunSteps).values({
    id: newId(),
    runId: run.id,
    stepId: step.id,
    type: step.type === 'action' ? step.action : step.type,
    status: entry.status,
    input: entry.input ?? null,
    output: entry.output ?? null,
    error: entry.error ?? null,
    attempt: entry.attempt,
    startedAt: entry.startedAt,
  });

export const finishRun = (
  tx: Db,
  runId: string,
  status: (typeof FINISHED_RUN_STATUSES)[number],
  ending: { error?: string; goal?: boolean; context?: RunContext } = {},
) =>
  tx
    .update(automationRuns)
    .set({
      status,
      error: ending.error ?? null,
      finishedAt: sql`now()`,
      waitingUntil: null,
      waitEvent: null,
      ...(ending.goal ? { goalReachedAt: sql`now()` } : {}),
      ...(ending.context ? { context: ending.context } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(automationRuns.id, runId));

/** Logs a finished step, records its output and moves the run on (or finishes it). */
export const continueAfter = async (
  tx: Db,
  run: RunRow,
  step: AutomationStep,
  context: RunContext,
  entry: { input: unknown; output: unknown; next: Cursor | null; attempt: number; startedAt: Date },
) => {
  const steps = z.record(z.string(), z.unknown()).safeParse(context.steps).data ?? {};
  const updated = { ...context, steps: { ...steps, [step.id]: { output: entry.output } } };

  await logStep(tx, run, step, { status: 'succeeded', ...entry });

  if (!entry.next) {
    await finishRun(tx, run.id, 'succeeded', { context: updated });

    return;
  }

  await tx
    .update(automationRuns)
    .set({
      context: updated,
      cursor: entry.next,
      status: 'running',
      waitingUntil: null,
      waitEvent: null,
      updatedAt: sql`now()`,
    })
    .where(eq(automationRuns.id, run.id));
  await queueAdvance(tx, run, entry.next);
};

export const ADVANCE_QUEUE = 'automation.advance';

/** Queues the run's step at `cursor`, now or at `runAt` (a delay, a wait's time limit). */
/** The job that advances a run at `cursor`. */
export const advanceJob = (run: Pick<RunRow, 'id' | 'orgId'>, cursor: Cursor, runAt?: Date) => ({
  orgId: run.orgId,
  queue: ADVANCE_QUEUE,
  payload: { runId: run.id },
  runAt,
  // One job per run, position and time: a step is never queued twice.
  dedupeKey: `${run.id}:${cursor.join('.')}:${runAt ? runAt.getTime() : 'now'}`,
});

export const queueAdvance = (
  tx: Db,
  run: Pick<RunRow, 'id' | 'orgId'>,
  cursor: Cursor,
  runAt?: Date,
) => enqueueJob(tx, advanceJob(run, cursor, runAt));

/**
 * Tells whoever turned the automation on that a run failed, collapsed to one
 * notification an hour per automation so a broken one doesn't flood them.
 */
const notifyFailure = async (tx: Db, run: RunRow, error: string) => {
  const [automation] = await tx
    .select()
    .from(automations)
    .where(eq(automations.id, run.automationId))
    .limit(1);

  if (!automation?.activatedBy) return;

  const hour = new Date().toISOString().slice(0, 13);

  await notify(tx, systemCaller(run.orgId), {
    userIds: [automation.activatedBy],
    kind: 'core.automation.failed',
    title: `“${automation.name}” failed`,
    body: error.slice(0, 500),
    link: `/automations/${automation.id}`,
    priority: 'high',
    entity: { type: 'automation', id: automation.id },
    dedupeKey: `automation-failed:${automation.id}:${hour}`,
    data: { runId: run.id },
  }).catch((notifyError: unknown) =>
    log.warn({ run: run.id, err: notifyError }, 'could not notify about a failed run'),
  );
};

/** After a step's last attempt: the run fails at that step and its owner hears. */
export const failRun = async (
  tx: Db,
  job: { orgId: string; attempt: number; payload: { runId: string; cursor?: Cursor } },
  error: string,
) => {
  const run = await lockLiveRun(tx, job.payload.runId);
  const { cursor } = job.payload;

  // A call for a step the run already left (cancelled, retried) fails nothing.
  if (!run || (cursor && !sameCursor(run.cursor, cursor))) return;

  const definition = await definitionOf(tx, run.automationId, run.version);
  const step = definition ? stepAt(definition.steps, run.cursor) : null;

  if (step)
    await logStep(tx, run, step, {
      status: 'failed',
      error,
      attempt: job.attempt,
      startedAt: new Date(),
    });

  await finishRun(tx, run.id, 'failed', { error });
  await notifyFailure(tx, run, error);
};

/** Continue a failed run at the step that failed. */
export const retryRun = async (tx: Db, runId: string) => {
  const [run] = await tx
    .update(automationRuns)
    .set({ status: 'running', error: null, finishedAt: null, updatedAt: sql`now()` })
    .where(and(eq(automationRuns.id, runId), eq(automationRuns.status, 'failed')))
    .returning();

  // A new time in the key: the failed attempt's job may still hold the old one.
  if (run) await queueAdvance(tx, run, run.cursor, new Date(Date.now() + 1));

  return run ?? null;
};

export const cancelRun = async (tx: Db, runId: string) => {
  const [run] = await tx
    .update(automationRuns)
    .set({
      status: 'cancelled',
      finishedAt: sql`now()`,
      waitingUntil: null,
      waitEvent: null,
      updatedAt: sql`now()`,
    })
    .where(
      and(eq(automationRuns.id, runId), inArray(automationRuns.status, ['running', 'waiting'])),
    )
    .returning();

  return run ?? null;
};
