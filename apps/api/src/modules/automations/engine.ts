import {
  automationRuns,
  automationRunSteps,
  automations,
  type Db,
  enterScope,
  withOrg,
} from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { defineJob } from '~/modules/jobs/jobs';
import type { AutomationStep } from '@erxes/core-contract';
import { coreAction } from './actions/catalog';
import { type CallContext, text } from './actions/context';
import { pluginForAction, runPluginAction } from './actions/plugin';
import { automationChecker } from './conditionCheck';
import { type Cursor, enterArm, nextCursor, sameCursor, stepAt } from './cursor';
import { type DecideStep, decide, decisionOutput } from './decide';
import { rememberActionOutput, rememberStepOutput } from './eventData';
import {
  ADVANCE_QUEUE,
  automationMember,
  continueAfter,
  definitionOf,
  failRun,
  finishRun,
  lockLiveRun,
  queueAdvance,
  type RunContext,
  RunPayload,
  type RunRow,
  subjectRefOf,
} from './runs';
import { subjectOf } from './subjects';
import { armConditions, finalError, renderInput, runStep } from './steps';

/** A run that loops through steps (branches can't, but be safe) stops after this many. */
const MAX_STEPS_PER_RUN = 500;

/** 5 attempts, 30 s first, each wait about twice the last, up to an hour. */
const RETRY = { attempts: 5, delay: 30, maxDelay: 3600 };

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
  timeoutSeconds: 120,
  retry: RETRY,
  async handle(job) {
    const startedAt = new Date();
    const prepared = await withOrg(job.orgId, (tx) => prepareCall(tx, job.orgId, job.payload));

    if (!prepared) return;

    const answer = await prepared.call().catch((error: unknown) => {
      const final = finalError(error);

      if (!final) throw error;

      return { final };
    });

    if ('final' in answer) {
      await withOrg(job.orgId, (tx) => failRun(tx, job, answer.final));

      return;
    }

    const { output, next } = answer;

    await withOrg(job.orgId, async (tx) => {
      await prepared.remember?.(tx, output);

      const run = await lockLiveRun(tx, job.payload.runId);

      if (run?.status !== 'running' || !sameCursor(run.cursor, job.payload.cursor)) return;

      const subject = await subjectOf(tx, run.subjectType, run.subjectId);

      await continueAfter(
        tx,
        run,
        prepared.step,
        { ...run.context, subject },
        { input: prepared.input, output, next, attempt: job.attempt, startedAt },
      );
    });
  },
  onDead: (job, error, tx) => failRun(tx, job, error),
});

interface PreparedCall {
  step: AutomationStep;
  input: unknown;
  call(): Promise<{ output: unknown; next: Cursor | null }>;
  remember?(tx: Db, output: unknown): Promise<void>;
}

interface CallSetup {
  orgId: string;
  run: RunRow;
  automation: typeof automations.$inferSelect;
  steps: AutomationStep[];
  context: RunContext;
  member: Awaited<ReturnType<typeof automationMember>>;
}

const prepareAction = async (
  tx: Db,
  { orgId, run, automation, steps, context, member }: CallSetup,
  step: Extract<AutomationStep, { type: 'action' }>,
): Promise<PreparedCall> => {
  const ctx: CallContext = {
    orgId,
    automation: { id: automation.id, name: automation.name },
    run: { id: run.id, depth: run.depth },
    step: { id: step.id },
    subject: subjectRefOf(run),
    input: await renderInput(tx, step.input, context),
    context,
  };

  const { send, learns } = await actionSender(tx, ctx, step.action);

  return {
    step,
    input: ctx.input,
    call: async () => ({
      output: await enterScope(member, orgId, send),
      next: nextCursor(steps, run.cursor),
    }),
    async remember(rememberTx, output) {
      await rememberStepOutput(rememberTx, automation.id, step, output);

      if (learns) await rememberActionOutput(rememberTx, step.action, output);
    },
  };
};

const actionSender = async (tx: Db, ctx: CallContext, type: string) => {
  const action = coreAction(type);

  if (action && 'call' in action) return { send: () => action.call(ctx), learns: false };

  const plugin = await pluginForAction(tx, type);

  return { send: () => runPluginAction(ctx, plugin, type), learns: true };
};

const prepareDecision = async (
  tx: Db,
  { orgId, run, steps, context, member }: CallSetup,
  step: DecideStep,
): Promise<PreparedCall> => {
  const filled = await renderInput(tx, { question: step.question, state: step.state }, context);

  const asked = {
    question: text(filled.question) ?? '',
    state: text(filled.state) || JSON.stringify({ subject: context.subject, event: context.event }),
  };

  return {
    step,
    input: asked,
    call: async () => {
      const decision = await enterScope(member, orgId, () => decide(orgId, step, asked));
      const { arm, output } = decisionOutput(step, decision);

      return { output, next: enterArm(steps, run.cursor, arm) };
    },
  };
};

/** What a call needs, read in a short transaction; null when the run moved on. */
const prepareCall = async (
  tx: Db,
  orgId: string,
  payload: { runId: string; cursor: Cursor },
): Promise<PreparedCall | null> => {
  const run = await lockLiveRun(tx, payload.runId);

  if (run?.status !== 'running' || !sameCursor(run.cursor, payload.cursor)) return null;

  const loaded = await loadStep(tx, run);

  if (!loaded || (loaded.step.type !== 'action' && loaded.step.type !== 'decide')) return null;

  const { automation, step, steps } = loaded;

  const setup: CallSetup = {
    orgId,
    run,
    automation,
    steps,
    context: { ...run.context, subject: await subjectOf(tx, run.subjectType, run.subjectId) },
    member: await automationMember(orgId, automation.activatedBy),
  };

  return step.type === 'decide' ? prepareDecision(tx, setup, step) : prepareAction(tx, setup, step);
};

/**
 * One step of a run, in the organisation's transaction together with the
 * run's progress and the next step's job: a step is never half done. A step
 * that throws rolls back and the job retries; after the last attempt the run
 * fails at that step, or at once when no retry can help. Before each step the goal is checked: met, the record
 * leaves. Steps that call other systems hand over to `callJob`.
 */
export const advanceJob = defineJob({
  queue: ADVANCE_QUEUE,
  payload: RunPayload,
  atomic: true,
  timeoutSeconds: 120,
  retry: RETRY,
  async handle(job, tx) {
    const run = await lockLiveRun(tx, job.payload.runId);
    const loaded = run ? await loadStep(tx, run) : null;

    if (!run || !loaded) return;

    if ((await stepCount(tx, run.id)) >= MAX_STEPS_PER_RUN) {
      await failRun(tx, job, `Stopped after ${MAX_STEPS_PER_RUN} steps`);

      return;
    }

    const { automation, steps, goal, step } = loaded;
    const subject = await subjectOf(tx, run.subjectType, run.subjectId);
    const context = { ...run.context, subject };

    const ref =
      run.subjectType && run.subjectId ? { type: run.subjectType, id: run.subjectId } : null;

    // The goal and the step's own conditions, in one check.
    const [goalMet, ...arms] = await automationChecker(tx, automation).check(ref, [
      { group: goal, context },
      ...armConditions(step).map((group) => ({ group, context })),
    ]);

    if (goal && goalMet) {
      await finishRun(tx, run.id, 'succeeded', { goal: true, context });

      return;
    }

    const startedAt = new Date();
    const outcome = await runStep({ tx, run, automation, steps, context, arms }, step);

    if (outcome.kind === 'failed') {
      await failRun(tx, job, outcome.error);

      return;
    }

    if (outcome.kind === 'call') {
      // Keyed by this job: its retries queue one call, a later retry of the run a new one.
      await callJob.enqueue(tx, {
        orgId: run.orgId,
        payload: { runId: run.id, cursor: run.cursor },
        dedupeKey: `call:${job.id}`,
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

    await continueAfter(tx, run, step, after, { ...outcome, attempt: job.attempt, startedAt });
  },
  onDead: (job, error, tx) => failRun(tx, job, error),
});
