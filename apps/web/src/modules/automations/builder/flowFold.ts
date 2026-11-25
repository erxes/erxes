import type { AutomationStep } from '@erxes/core-contract';
import { armsOf } from './flowModel';

/** How many steps a list holds, its arms' steps included. */
export const countSteps = (steps: AutomationStep[]): number =>
  steps.reduce(
    (total, step) => total + 1 + armsOf(step).reduce((sum, arm) => sum + countSteps(arm.steps), 0),
    0,
  );

const branchingIds = (steps: AutomationStep[]): string[] =>
  steps.flatMap((step) => {
    const arms = armsOf(step);

    return arms.length ? [step.id, ...arms.flatMap((arm) => branchingIds(arm.steps))] : [];
  });

/** How many cards wide a list is drawn, with the folded steps drawn as one card. */
const widthOf = (steps: AutomationStep[], folded: Set<string>): number =>
  Math.max(
    1,
    ...steps.map((step) => {
      const arms = armsOf(step);

      return arms.length && !folded.has(step.id)
        ? arms.reduce((sum, arm) => sum + widthOf(arm.steps, folded), 0)
        : 1;
    }),
  );

const MAX_COLUMNS = 6;

/**
 * The branching steps that start folded. Top-level ones always open; deeper ones open,
 * shallowest first, while the flow stays at most six cards wide.
 */
export const foldedAtStart = (steps: AutomationStep[]): Set<string> => {
  const folded = new Set(branchingIds(steps));
  const queue = steps.map((step) => ({ step, top: true }));

  for (const { step, top } of queue) {
    const arms = armsOf(step);

    if (!arms.length) continue;

    folded.delete(step.id);

    if (!top && widthOf(steps, folded) > MAX_COLUMNS) {
      folded.add(step.id);
      continue;
    }

    queue.push(...arms.flatMap((arm) => arm.steps.map((inner) => ({ step: inner, top: false }))));
  }

  return folded;
};
