import type { AutomationStep } from '@erxes/core-contract';
import { type automations, type Db, runAs, savepoint } from '@erxes/core-db';
import { ORPCError } from '@orpc/server';
import { fromDatabase } from '~/http/errors';
import { withRunCause } from '~/lib/causation';
import { coreAction } from './actions/catalog';
import type { ActionContext } from './actions/context';
import { type Cursor, enterArm, nextCursor, splitPath } from './cursor';
import { automationMember, type RunContext, type RunRow, subjectRefOf } from './runs';
import { render } from './templates';

export type StepOutcome =
  | { kind: 'done'; input: unknown; output: unknown; next: Cursor | null }
  | { kind: 'wait'; until: Date; event: string | null }
  /** The step calls another system: the call job runs it outside this transaction. */
  | { kind: 'call' }
  /** The step can't succeed on a retry: the run fails now. */
  | { kind: 'failed'; error: string };

/** Errors a retry can't fix: email that would only reach the log stays so until an admin acts. */
const FINAL_ERRORS: ReadonlySet<string> = new Set(['EMAIL_NOT_CONFIGURED']);

export interface StepState {
  tx: Db;
  run: RunRow;
  automation: typeof automations.$inferSelect;
  steps: AutomationStep[];
  context: RunContext;
  /** Whether each of the step's `armConditions` holds, checked before the step. */
  arms: boolean[];
}

/** The conditions a step picks its arm by: a branch's, each of a switch's cases'. */
export const armConditions = (step: AutomationStep) => {
  if (step.type === 'branch') return [step.conditions];

  if (step.type === 'switch') return step.cases.map((item) => item.conditions);

  return [];
};

const SECONDS = { minutes: 60, hours: 3600, days: 86_400 } as const;

/** An action step's input with its placeholders filled from the run's context. */
export const renderInput = (input: Record<string, unknown>, context: RunContext) =>
  Object.fromEntries(Object.entries(input).map(([key, value]) => [key, render(value, context)]));

const delayUntil = (step: Extract<AutomationStep, { type: 'delay' }>, context: RunContext) => {
  if (step.until) {
    const rendered = render(step.until, context);
    const time = typeof rendered === 'string' ? Date.parse(rendered) : Number.NaN;

    if (Number.isNaN(time))
      throw new Error(`${JSON.stringify(rendered)} is not a date to wait until`);

    return new Date(time);
  }

  return new Date(Date.now() + SECONDS[step.unit ?? 'minutes'] * (step.amount ?? 1) * 1000);
};

const done = (output: unknown, next: Cursor | null): StepOutcome => ({
  kind: 'done',
  input: null,
  output,
  next,
});

/** Runs a core action that changes core's data, in the step's transaction. */
const runLocalAction = async (
  state: StepState,
  step: Extract<AutomationStep, { type: 'action' }>,
  run: (ctx: ActionContext) => Promise<unknown>,
): Promise<StepOutcome> => {
  const { tx, automation, context } = state;
  const input = renderInput(step.input, context);

  const member = await automationMember(state.run.orgId, automation.activatedBy);

  const ctx: ActionContext = {
    tx,
    orgId: state.run.orgId,
    automation: { id: automation.id, name: automation.name },
    run: { id: state.run.id },
    step: { id: step.id },
    subject: subjectRefOf(state.run),
    input,
    context,
  };

  const cause = {
    runId: state.run.id,
    automationId: automation.id,
    automationName: automation.name,
    depth: state.run.depth,
  };

  try {
    // In a savepoint: a step that fails for good leaves none of its writes behind.
    const output = await withRunCause(cause, () =>
      savepoint(() =>
        // A unique or reference conflict fails the run with what it means.
        runAs(member, () => run(ctx)).catch((error: unknown) => {
          throw fromDatabase(error);
        }),
      ),
    );

    return { kind: 'done', input, output, next: nextCursor(state.steps, state.run.cursor) };
  } catch (error) {
    if (
      error instanceof ORPCError &&
      typeof error.code === 'string' &&
      FINAL_ERRORS.has(error.code)
    )
      return { kind: 'failed', error: error.message };

    throw error;
  }
};

/** What the step at the run's cursor does: move on, wait, or call out. */
export const runStep = async (state: StepState, step: AutomationStep): Promise<StepOutcome> => {
  const { run, steps, context, arms } = state;
  const cursor = run.cursor;

  switch (step.type) {
    case 'stop':
      return done(null, null);

    case 'branch': {
      const matched = arms[0] === true;

      return done({ matched }, enterArm(steps, cursor, matched ? 'then' : 'else'));
    }

    case 'switch': {
      const chosen = arms.findIndex(Boolean);
      const label = step.cases[chosen]?.label ?? null;

      if (chosen < 0)
        return done({ case: 'otherwise', label }, enterArm(steps, cursor, 'otherwise'));

      return done({ case: chosen, label }, enterArm(steps, cursor, `case:${chosen}`));
    }

    case 'split': {
      const path = splitPath(run.id, step);

      return done(
        { path, label: step.paths[path]?.label ?? null },
        enterArm(steps, cursor, `path:${path}`),
      );
    }

    case 'delay': {
      // First time here: wait. Woken up: carry on.
      if (run.status !== 'waiting') {
        const until = delayUntil(step, context);

        if (until.getTime() > Date.now()) return { kind: 'wait', until, event: null };
      }

      const waitedUntil = (run.waitingUntil ?? new Date()).toISOString();

      return done({ waitedUntil }, nextCursor(steps, cursor));
    }

    case 'wait_for': {
      // Wait for the event (the consumer resumes the run) or the time limit (this job again).
      if (run.status !== 'waiting') {
        const until = new Date(Date.now() + SECONDS[step.unit] * step.amount * 1000);

        return { kind: 'wait', until, event: step.event };
      }

      return done({ matched: false, timedOut: true }, nextCursor(steps, cursor));
    }

    case 'action': {
      const action = coreAction(step.action);

      if (action && 'run' in action) return runLocalAction(state, step, action.run);

      return { kind: 'call' };
    }
  }
};
