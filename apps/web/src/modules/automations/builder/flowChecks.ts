import type { ActionField, ActionInfo, AutomationStep } from '@erxes/core-contract';
import type { StartingEvent } from './BuilderContext';
import { armsOf } from './flowModel';
import type { FieldInfo } from './useAutomationFields';

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length);

/** The action's required inputs the step leaves empty. */
export const emptyRequired = (input: Record<string, unknown>, action: ActionInfo | undefined) =>
  (action?.fields ?? []).filter((field) => field.required && isEmpty(input[field.key]));

/** What an empty required input says, under the input and on the canvas card. */
export const fillIn = (field: ActionField) => `Fill in ${field.label.toLowerCase()}`;

/** What keeps a step from working, before the server says so. */
const stepProblems = (step: AutomationStep, actions: ActionInfo[]): string[] => {
  switch (step.type) {
    case 'action': {
      const action = actions.find((item) => item.type === step.action);

      if (!action) return ['This action is not available (its plugin may be uninstalled)'];

      return emptyRequired(step.input, action).map(fillIn);
    }

    case 'branch':
      return step.conditions.rules.length ? [] : ['Add a condition'];
    case 'switch':
      return step.cases.some((item) => !item.conditions.rules.length)
        ? ['Every case needs a condition']
        : [];
    default:
      return [];
  }
};

/** Every problem in the flow, by step id. */
export const flowProblems = (
  steps: AutomationStep[],
  actions: ActionInfo[],
  into = new Map<string, string[]>(),
) => {
  for (const step of steps) {
    const problems = stepProblems(step, actions);

    if (problems.length) into.set(step.id, problems);

    for (const arm of armsOf(step)) flowProblems(arm.steps, actions, into);
  }

  return into;
};

export const countSteps = (steps: AutomationStep[]): number =>
  steps.reduce(
    (sum, step) => sum + 1 + armsOf(step).reduce((inner, arm) => inner + countSteps(arm.steps), 0),
    0,
  );

/**
 * What the steps before `id` can use besides the record: the trigger event's values
 * ("Deal" of "Deal created") and earlier steps' outputs ("Create a deal: Deal",
 * "Customer updated within the wait").
 */
export const stepOutputFields = (
  steps: AutomationStep[],
  id: string | null,
  context: {
    events: { type: string; label: string }[];
    actions: ActionInfo[];
    /** The trigger event's own values, as its plugin declares them. */
    trigger?: StartingEvent;
  },
): FieldInfo[] => {
  const { trigger } = context;

  const out: FieldInfo[] = (trigger?.fields ?? []).map((field) => ({
    path: `event.payload.${field.key}`,
    label: field.label,
    type: field.type,
    from: trigger?.label,
    source: trigger?.source,
    recordType: field.recordType,
  }));

  const walk = (list: AutomationStep[]): boolean => {
    for (const step of list) {
      if (step.id === id) return true;

      if (step.type === 'action') {
        const action = context.actions.find((item) => item.type === step.action);
        const title = step.label || action?.label || step.action;

        for (const output of action?.outputs ?? []) {
          out.push({
            path: `steps.${step.id}.output.${output.key}`,
            label: `${title}: ${output.label}`,
            type: output.type,
            source: action?.source,
            recordType: output.recordType,
          });
        }
      }

      if (step.type === 'wait_for') {
        const label =
          step.label ||
          (context.events.find((item) => item.type === step.event)?.label ?? step.event);

        out.push({
          path: `steps.${step.id}.output.matched`,
          label: `${label} within the wait`,
          type: 'boolean',
        });
      }

      for (const arm of armsOf(step)) if (walk(arm.steps)) return true;
    }

    return false;
  };

  walk(steps);

  return out;
};
