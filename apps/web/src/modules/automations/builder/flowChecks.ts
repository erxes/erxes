import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { armsOf } from './flowModel';
import type { FieldInfo } from './useAutomationFields';

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length);

/** What keeps a step from working, before the server says so. */
const stepProblems = (step: AutomationStep, actions: ActionInfo[]): string[] => {
  switch (step.type) {
    case 'action': {
      const action = actions.find((item) => item.type === step.action);

      if (!action) return ['This action is not available (its plugin may be uninstalled)'];

      return action.fields
        .filter((field) => field.required && isEmpty(step.input[field.key]))
        .map((field) => `Fill in ${field.label.toLowerCase()}`);
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

/** Outputs of the steps before `id` that conditions can use ("Customer updated happened"). */
export const stepOutputFields = (
  steps: AutomationStep[],
  id: string | null,
  context: { events: { type: string; label: string }[] },
): FieldInfo[] => {
  const out: FieldInfo[] = [];

  const walk = (list: AutomationStep[]): boolean => {
    for (const step of list) {
      if (step.id === id) return true;

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
