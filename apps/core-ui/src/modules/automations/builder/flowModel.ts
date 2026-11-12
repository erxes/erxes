import type { ActionInfo, AutomationStep } from '@erxes/core-contract';

/** Where a list of steps lives: the top, or one arm (`then`, `case:1`, `path:0`, …) of a step. */
export interface ListAddress {
  parentId: string | null;
  arm: string | null;
}

export interface Arm {
  key: string;
  label: string;
  steps: AutomationStep[];
}

const newStepId = () => Math.random().toString(36).slice(2, 10);

/** The lists of steps a branching step holds, in display order. */
export const armsOf = (step: AutomationStep): Arm[] => {
  switch (step.type) {
    case 'branch':
      return [
        { key: 'then', label: 'Yes', steps: step.then },
        { key: 'else', label: 'No', steps: step.else },
      ];
    case 'switch':
      return [
        ...step.cases.map((item, index) => ({
          key: `case:${index}`,
          label: item.label || `Case ${index + 1}`,
          steps: item.steps,
        })),
        { key: 'otherwise', label: 'Otherwise', steps: step.otherwise },
      ];
    case 'split':
      return step.paths.map((path, index) => ({
        key: `path:${index}`,
        label: `${path.label || String.fromCharCode(65 + index)} · ${path.weight}%`,
        steps: path.steps,
      }));
    default:
      return [];
  }
};

const withArm = (step: AutomationStep, arm: string, steps: AutomationStep[]): AutomationStep => {
  if (step.type === 'branch' && (arm === 'then' || arm === 'else'))
    return { ...step, [arm]: steps };

  if (step.type === 'switch') {
    if (arm === 'otherwise') return { ...step, otherwise: steps };

    const index = Number(arm.split(':')[1]);

    return {
      ...step,
      cases: step.cases.map((item, at) => (at === index ? { ...item, steps } : item)),
    };
  }

  if (step.type === 'split') {
    const index = Number(arm.split(':')[1]);

    return {
      ...step,
      paths: step.paths.map((path, at) => (at === index ? { ...path, steps } : path)),
    };
  }

  return step;
};

/** Applies `fn` to the list at `address` (deep), leaving everything else as is. */
const updateList = (
  steps: AutomationStep[],
  address: ListAddress,
  fn: (list: AutomationStep[]) => AutomationStep[],
): AutomationStep[] => {
  if (address.parentId === null) return fn(steps);

  return steps.map((step) => {
    if (step.id === address.parentId && address.arm) {
      const arm = armsOf(step).find((item) => item.key === address.arm);

      return arm ? withArm(step, address.arm, fn(arm.steps)) : step;
    }

    return armsOf(step).reduce(
      (current, arm) => withArm(current, arm.key, updateList(arm.steps, address, fn)),
      step,
    );
  });
};

export const findStep = (steps: AutomationStep[], id: string): AutomationStep | null => {
  for (const step of steps) {
    if (step.id === id) return step;

    for (const arm of armsOf(step)) {
      const found = findStep(arm.steps, id);

      if (found) return found;
    }
  }

  return null;
};

/** The list a step is in, and its place there. */
export const locate = (
  steps: AutomationStep[],
  id: string,
  address: ListAddress = { parentId: null, arm: null },
): { address: ListAddress; index: number; length: number } | null => {
  const index = steps.findIndex((step) => step.id === id);

  if (index >= 0) return { address, index, length: steps.length };

  for (const step of steps) {
    for (const arm of armsOf(step)) {
      const found = locate(arm.steps, id, { parentId: step.id, arm: arm.key });

      if (found) return found;
    }
  }

  return null;
};

export const replaceStep = (steps: AutomationStep[], next: AutomationStep): AutomationStep[] => {
  const at = locate(steps, next.id);

  return at
    ? updateList(steps, at.address, (list) =>
        list.map((step) => (step.id === next.id ? next : step)),
      )
    : steps;
};

export const removeStep = (steps: AutomationStep[], id: string): AutomationStep[] => {
  const at = locate(steps, id);

  return at
    ? updateList(steps, at.address, (list) => list.filter((step) => step.id !== id))
    : steps;
};

export const moveStep = (steps: AutomationStep[], id: string, delta: -1 | 1): AutomationStep[] => {
  const at = locate(steps, id);

  if (!at || at.index + delta < 0 || at.index + delta >= at.length) return steps;

  return updateList(steps, at.address, (list) => {
    const moved = list[at.index];

    return moved ? list.toSpliced(at.index, 1).toSpliced(at.index + delta, 0, moved) : list;
  });
};

export const insertStep = (
  steps: AutomationStep[],
  address: ListAddress,
  index: number,
  step: AutomationStep,
) => updateList(steps, address, (list) => [...list.slice(0, index), step, ...list.slice(index)]);

/** A copy with fresh ids (arms included), for "duplicate". */
export const cloneStep = (step: AutomationStep): AutomationStep => {
  const copy = { ...step, id: newStepId() };

  return armsOf(copy).reduce(
    (current, arm) => withArm(current, arm.key, arm.steps.map(cloneStep)),
    copy,
  );
};

const STEP_TYPES = ['action', 'delay', 'wait_for', 'branch', 'switch', 'split', 'stop'] as const;

export type StepType = (typeof STEP_TYPES)[number];

export const STEP_TITLES: Record<StepType, string> = {
  action: 'Action',
  delay: 'Wait',
  wait_for: 'Wait for an event',
  branch: 'If / else',
  switch: 'Choose a path',
  split: 'A/B split',
  stop: 'Stop',
};

/** A new action's starting inputs: an email goes to the record itself until told otherwise. */
export const actionDefaults = (action: ActionInfo | undefined): Record<string, unknown> =>
  Object.fromEntries(
    (action?.fields ?? [])
      .filter((field) => field.type === 'recipients')
      .map((field) => [field.key, 'subject']),
  );

export const newStep = (
  type: StepType,
  actions: ActionInfo[],
  subject: 'customer' | 'company',
): AutomationStep => {
  const id = newStepId();

  const firstAction =
    actions.find(
      (item) => item.subject === null || item.subject === 'any' || item.subject === subject,
    ) ?? actions[0];

  switch (type) {
    case 'action':
      return {
        id,
        type,
        action: firstAction?.type ?? 'core.note.add',
        input: actionDefaults(firstAction),
      };
    case 'delay':
      return { id, type, amount: 1, unit: 'hours' };
    case 'wait_for':
      return { id, type, event: 'core.customer.updated', amount: 3, unit: 'days' };
    case 'branch':
      return { id, type, conditions: { match: 'all', rules: [] }, then: [], else: [] };
    case 'switch':
      return {
        id,
        type,
        cases: [{ conditions: { match: 'all', rules: [] }, steps: [] }],
        otherwise: [],
      };
    case 'split':
      return {
        id,
        type,
        paths: [
          { label: 'A', weight: 50, steps: [] },
          { label: 'B', weight: 50, steps: [] },
        ],
      };
    default:
      return { id, type: 'stop' };
  }
};
