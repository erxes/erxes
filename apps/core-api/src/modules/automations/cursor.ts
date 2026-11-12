import type { AutomationStep } from '@erxes/core-contract';
import { createHash } from 'node:crypto';

/**
 * Where a run is: step indexes and the arm taken at each nesting level,
 * e.g. `[2, "then", 0]` or `[1, "case:0", 3]`.
 */
export type Cursor = (number | string)[];

/**
 * The steps inside a step's arm: `then`/`else` (branch), `case:N`/`otherwise`
 * (switch), `path:N` (split).
 */
const armSteps = (step: AutomationStep, arm: string): AutomationStep[] | null => {
  if (step.type === 'branch') {
    if (arm === 'then') return step.then;

    return arm === 'else' ? step.else : null;
  }

  if (step.type === 'switch') {
    if (arm === 'otherwise') return step.otherwise;

    if (arm.startsWith('case:')) return step.cases[Number(arm.slice(5))]?.steps ?? null;
  }

  if (step.type === 'split' && arm.startsWith('path:'))
    return step.paths[Number(arm.slice(5))]?.steps ?? null;

  return null;
};

/** The step a cursor points at, or null past the end. */
export const stepAt = (steps: AutomationStep[], cursor: Cursor): AutomationStep | null => {
  let list = steps;
  let step: AutomationStep | undefined;

  for (let index = 0; index < cursor.length; index += 2) {
    step = list[Number(cursor[index])];

    if (!step) return null;

    const arm = cursor[index + 1];

    if (arm !== undefined) {
      const inner = armSteps(step, String(arm));

      if (!inner) return null;
      list = inner;
    }
  }

  return step ?? null;
};

/** The step after `cursor`: the next in its list, else after the enclosing step. */
export const nextCursor = (steps: AutomationStep[], cursor: Cursor): Cursor | null => {
  let current = [...cursor];

  for (;;) {
    const next = [...current.slice(0, -1), Number(current.at(-1)) + 1];

    if (stepAt(steps, next)) return next;

    if (current.length === 1) return null;

    current = current.slice(0, -2);
  }
};

/** Into an arm, or past the step when that arm is empty. */
export const enterArm = (steps: AutomationStep[], cursor: Cursor, arm: string): Cursor | null => {
  const inside = [...cursor, arm, 0];

  return stepAt(steps, inside) ? inside : nextCursor(steps, cursor);
};

export const sameCursor = (a: Cursor, b: Cursor) =>
  a.length === b.length && a.every((part, index) => part === b[index]);

/** A split's path for a run: by weight, the same every time for the same run. */
export const splitPath = (runId: string, step: Extract<AutomationStep, { type: 'split' }>) => {
  const total = step.paths.reduce((sum, path) => sum + path.weight, 0);
  const roll = createHash('sha256').update(`${runId}:${step.id}`).digest().readUInt32BE(0) % total;
  let seen = 0;

  for (const [index, path] of step.paths.entries()) {
    seen += path.weight;

    if (roll < seen) return index;
  }

  return step.paths.length - 1;
};
