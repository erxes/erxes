import type { AutomationStep } from '@erxes/core-contract';
import type { automations, Db } from '@erxes/core-db';
import { withRunCause } from '~/lib/causation';
import { coreAction } from './actions/catalog';
import type { ActionContext } from './actions/context';
import { evaluateGroup } from './conditions';
import { type Cursor, enterArm, nextCursor, splitPath } from './cursor';
import { actorOf, type RunContext, type RunRow, subjectRefOf } from './runs';
import { render } from './templates';

export type StepOutcome =
  | { kind: 'done'; input: unknown; output: unknown; next: Cursor | null }
  | { kind: 'wait'; until: Date; event: string | null }
  /** The step calls another system: the call job runs it outside this transaction. */
  | { kind: 'call' };

export interface StepState {
  tx: Db;
  run: RunRow;
  automation: typeof automations.$inferSelect;
  steps: AutomationStep[];
  context: RunContext;
}

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

  const ctx: ActionContext = {
    tx,
    orgId: state.run.orgId,
    actor: await actorOf(tx, state.run.orgId, automation.activatedBy),
    automation: { id: automation.id, name: automation.name },
    run: { id: state.run.id },
    step: { id: step.id },
    subject: subjectRefOf(state.run),
    input,
    context,
  };

  const output = await withRunCause(
    {
      runId: state.run.id,
      automationId: automation.id,
      automationName: automation.name,
      depth: state.run.depth,
    },
    () => run(ctx),
  );

  return { kind: 'done', input, output, next: nextCursor(state.steps, state.run.cursor) };
};

/** What the step at the run's cursor does: move on, wait, or call out. */
export const runStep = async (state: StepState, step: AutomationStep): Promise<StepOutcome> => {
  const { run, steps, context } = state;
  const cursor = run.cursor;

  switch (step.type) {
    case 'stop':
      return done(null, null);

    case 'branch': {
      const matched = evaluateGroup(step.conditions, context);

      return done({ matched }, enterArm(steps, cursor, matched ? 'then' : 'else'));
    }

    case 'switch': {
      const chosen = step.cases.findIndex((item) => evaluateGroup(item.conditions, context));
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
