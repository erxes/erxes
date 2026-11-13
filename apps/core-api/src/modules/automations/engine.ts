import { automationRuns, automationRunSteps, automations, type Db, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { defineJob } from '~/modules/jobs/jobs';
import { coreAction } from './actions/catalog';
import type { CallContext } from './actions/context';
import { pluginForAction, runPluginAction } from './actions/plugin';
import { evaluateGroup } from './conditions';
import { type Cursor, nextCursor, sameCursor, stepAt } from './cursor';
import {
  ADVANCE_QUEUE,
  actorOf,
  continueAfter,
  definitionOf,
  failRun,
  finishRun,
  lockLiveRun,
  queueAdvance,
  RunPayload,
  type RunRow,
  subjectRefOf,
} from './runs';
import { subjectOf } from './subjects';
import { renderInput, runStep } from './steps';

/** A run that loops through steps (branches can't, but be safe) stops after this many. */
const MAX_STEPS_PER_RUN = 500;

const backoff = (attempt: number) => [30, 120, 600, 1800][attempt - 1] ?? 3600;

/** The run's automation, its version's definition and the step at its cursor; else the run ends. */
const loadStep = async (tx: Db, run: RunRow) => {
  const [automation] = await tx
    .select()
    .from(automations)
    .where(eq(automations.id, run.automationId))
    .limit(1);

  const definition = automation ? await definitionOf(tx, run.automationId, run.version) : null;

  if (!automation || !definition) {
    await finishRun(tx, run.id, 'failed', { error: 'The automation or its version is gone' });

    return null;
  }

  const step = stepAt(definition.steps, run.cursor);

  if (!step) {
    await finishRun(tx, run.id, 'succeeded');

    return null;
  }

  return { automation, steps: definition.steps, goal: definition.goal, step };
};

const stepCount = async (tx: Db, runId: string) => {
  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(automationRunSteps)
    .where(eq(automationRunSteps.runId, runId));

  return row?.count ?? 0;
};

const CallPayload = RunPayload.extend({ cursor: z.array(z.union([z.number(), z.string()])) });

/**
 * An action step that calls another system (a plugin's action, a webhook).
 * The call runs outside any transaction, so a slow remote holds no database
 * connection or row lock; then a short transaction records the answer and
 * moves the run on, unless it was cancelled or moved meanwhile. A retry sends
 * the same `Idempotency-Key`, so the remote does the work once.
 */
export const callJob = defineJob({
  queue: 'automation.call',
  payload: CallPayload,
  leaseSeconds: 120,
  backoff,
  async handle(job) {
    const startedAt = new Date();
    const prepared = await withOrg(job.orgId, (tx) => prepareCall(tx, job.orgId, job.payload));

    if (!prepared) return;

    const output = await prepared.call();

    await withOrg(job.orgId, async (tx) => {
      const run = await lockLiveRun(tx, job.payload.runId);

      if (run?.status !== 'running' || !sameCursor(run.cursor, job.payload.cursor)) return;

      const subject = await subjectOf(tx, run.subjectType, run.subjectId);

      await continueAfter(
        tx,
        run,
        prepared.step,
        { ...run.context, subject },
        {
          input: prepared.input,
          output,
          next: nextCursor(prepared.steps, run.cursor),
          attempt: job.attempts,
          startedAt,
        },
      );
    });
  },
  onDead: (job, error, tx) => failRun(tx, job, error),
});

/** What a call needs, read in a short transaction; null when the run moved on. */
const prepareCall = async (tx: Db, orgId: string, payload: { runId: string; cursor: Cursor }) => {
  const run = await lockLiveRun(tx, payload.runId);

  if (run?.status !== 'running' || !sameCursor(run.cursor, payload.cursor)) return null;

  const loaded = await loadStep(tx, run);

  if (loaded?.step.type !== 'action') return null;

  const { automation, step } = loaded;

  const context = {
    ...run.context,
    subject: await subjectOf(tx, run.subjectType, run.subjectId),
  };

  const ctx: CallContext = {
    orgId,
    actor: await actorOf(tx, orgId, automation.activatedBy),
    automation: { id: automation.id, name: automation.name },
    run: { id: run.id },
    step: { id: step.id },
    subject: subjectRefOf(run),
    input: renderInput(step.input, context),
    context,
  };

  const prepared = { step, steps: loaded.steps, input: ctx.input };
  const action = coreAction(step.action);

  if (action && 'call' in action) return { ...prepared, call: () => action.call(ctx) };

  const plugin = await pluginForAction(tx, step.action);

  return { ...prepared, call: () => runPluginAction(ctx, plugin, step.action) };
};

/**
 * One step of a run, in the organisation's transaction together with the
 * run's progress and the next step's job: a step is never half done. A step
 * that throws rolls back and the job retries; after the last attempt the run
 * fails at that step. Before each step the goal is checked: met, the record
 * leaves. Steps that call other systems hand over to `callJob`.
 */
export const advanceJob = defineJob({
  queue: ADVANCE_QUEUE,
  payload: RunPayload,
  atomic: true,
  leaseSeconds: 120,
  backoff,
  async handle(job, tx) {
    const run = await lockLiveRun(tx, job.payload.runId);
    const loaded = run ? await loadStep(tx, run) : null;

    if (!run || !loaded) return;

    if ((await stepCount(tx, run.id)) >= MAX_STEPS_PER_RUN) {
      await finishRun(tx, run.id, 'failed', { error: `Stopped after ${MAX_STEPS_PER_RUN} steps` });

      return;
    }

    const { automation, steps, goal, step } = loaded;
    const subject = await subjectOf(tx, run.subjectType, run.subjectId);
    const context = { ...run.context, subject };

    if (goal && evaluateGroup(goal, context)) {
      await finishRun(tx, run.id, 'succeeded', { goal: true, context });

      return;
    }

    const startedAt = new Date();
    const outcome = await runStep({ tx, run, automation, steps, context }, step);

    if (outcome.kind === 'call') {
      // Keyed by this job: its retries queue one call, a later retry of the run a new one.
      await callJob.enqueue(tx, {
        orgId: run.orgId,
        payload: { runId: run.id, cursor: run.cursor },
        dedupeKey: `call:${job.id}`,
        maxAttempts: 5,
      });

      return;
    }

    if (outcome.kind === 'wait') {
      await tx
        .update(automationRuns)
        .set({
          status: 'waiting',
          waitingUntil: outcome.until,
          waitEvent: outcome.event,
          context,
          updatedAt: sql`now()`,
        })
        .where(eq(automationRuns.id, run.id));
      await queueAdvance(tx, run, run.cursor, outcome.until);

      return;
    }

    // Actions may have changed the subject: later steps see it as it is now.
    const after =
      step.type === 'action'
        ? { ...context, subject: await subjectOf(tx, run.subjectType, run.subjectId) }
        : context;

    await continueAfter(tx, run, step, after, { ...outcome, attempt: job.attempts, startedAt });
  },
  onDead: (job, error, tx) => failRun(tx, job, error),
});
