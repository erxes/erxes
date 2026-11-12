import { AutomationDefinition, type AutomationStep } from '@erxes/core-contract';
import {
  automationRuns,
  automationRunSteps,
  automations,
  automationVersions,
  type Db,
  newId,
  roles,
  users,
} from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { type Actor, systemCaller } from '~/http/auth';
import { log } from '~/lib/log';
import { enqueueJob } from '~/modules/jobs/jobs';
import { notify } from '~/modules/notifications/notifications.service';
import { type Cursor, sameCursor, stepAt } from './cursor';

export type RunRow = typeof automationRuns.$inferSelect;

export type RunContext = Record<string, unknown>;

export type SubjectRef = { type: 'customer' | 'company'; id: string };

export const subjectRefOf = (run: Pick<RunRow, 'subjectType' | 'subjectId'>): SubjectRef | null =>
  (run.subjectType === 'customer' || run.subjectType === 'company') && run.subjectId
    ? { type: run.subjectType, id: run.subjectId }
    : null;

export const definitionOf = async (tx: Db, automationId: string, version: number) => {
  const [row] = await tx
    .select({ definition: automationVersions.definition })
    .from(automationVersions)
    .where(
      and(
        eq(automationVersions.automationId, automationId),
        eq(automationVersions.version, version),
      ),
    )
    .limit(1);

  return row ? AutomationDefinition.parse(row.definition) : null;
};

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
    .where(and(eq(users.orgId, orgId), eq(users.id, userId)))
    .limit(1);

  if (row?.status !== 'active')
    throw new Error('The member who turned this automation on is no longer active');

  return { userId: row.id, orgId, role: row.role, permissions: row.permissions };
};

export const RunPayload = z.object({ runId: z.string() });

/** One run's row, locked for this transaction, if it is still in progress. */
export const lockLiveRun = async (tx: Db, orgId: string, runId: string) => {
  const [run] = await tx
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.orgId, orgId), eq(automationRuns.id, runId)))
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
    orgId: run.orgId,
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
  status: 'succeeded' | 'failed' | 'cancelled',
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
  const steps = z.record(z.string(), z.unknown()).catch({}).parse(context.steps);
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
export const queueAdvance = (
  tx: Db,
  run: Pick<RunRow, 'id' | 'orgId'>,
  cursor: Cursor,
  runAt?: Date,
) =>
  enqueueJob(tx, {
    orgId: run.orgId,
    queue: ADVANCE_QUEUE,
    payload: { runId: run.id },
    runAt,
    // One job per run, position and time: a step is never queued twice.
    dedupeKey: `${run.id}:${cursor.join('.')}:${runAt ? runAt.getTime() : 'now'}`,
    maxAttempts: 5,
  });

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
    log.warn('could not notify about a failed run', { error: notifyError }),
  );
};

/** After a step's last attempt: the run fails at that step and its owner hears. */
export const failRun = async (
  tx: Db,
  job: { orgId: string; attempts: number; payload: { runId: string; cursor?: Cursor } },
  error: string,
) => {
  const run = await lockLiveRun(tx, job.orgId, job.payload.runId);
  const { cursor } = job.payload;

  // A call for a step the run already left (cancelled, retried) fails nothing.
  if (!run || (cursor && !sameCursor(run.cursor, cursor))) return;

  const definition = await definitionOf(tx, run.automationId, run.version);
  const step = definition ? stepAt(definition.steps, run.cursor) : null;

  if (step)
    await logStep(tx, run, step, {
      status: 'failed',
      error,
      attempt: job.attempts,
      startedAt: new Date(),
    });

  await finishRun(tx, run.id, 'failed', { error });
  await notifyFailure(tx, run, error);
};

/** Continue a failed run at the step that failed. */
export const retryRun = async (tx: Db, orgId: string, runId: string) => {
  const [run] = await tx
    .update(automationRuns)
    .set({ status: 'running', error: null, finishedAt: null, updatedAt: sql`now()` })
    .where(
      and(
        eq(automationRuns.orgId, orgId),
        eq(automationRuns.id, runId),
        eq(automationRuns.status, 'failed'),
      ),
    )
    .returning();

  // A new time in the key: the failed attempt's job may still hold the old one.
  if (run) await queueAdvance(tx, run, run.cursor, new Date(Date.now() + 1));

  return run ?? null;
};

export const cancelRun = async (tx: Db, orgId: string, runId: string) => {
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
      and(
        eq(automationRuns.orgId, orgId),
        eq(automationRuns.id, runId),
        inArray(automationRuns.status, ['running', 'waiting']),
      ),
    )
    .returning();

  return run ?? null;
};
