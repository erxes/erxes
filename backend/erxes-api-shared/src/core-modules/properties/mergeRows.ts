import { PropertyFilterQuery } from './types';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

type RowClause = { path: string; inner: Record<string, unknown> };

const asRowClause = (condition: PropertyFilterQuery): RowClause | null => {
  const keys = Object.keys(condition);

  if (keys.length !== 1) {
    return null;
  }

  const [path] = keys;
  const value = condition[path];

  if (!isPlainObject(value) || Object.keys(value).length !== 1) {
    return null;
  }

  return isPlainObject(value.$elemMatch)
    ? { path, inner: value.$elemMatch }
    : null;
};

const canAbsorb = (
  open: Record<string, unknown>,
  inner: Record<string, unknown>,
) =>
  Object.entries(inner).every(([leaf, value]) => {
    if (!(leaf in open)) {
      return true;
    }

    const current = open[leaf];

    return (
      isPlainObject(current) &&
      isPlainObject(value) &&
      Object.keys(value).every((operator) => !(operator in current))
    );
  });

const absorb = (
  open: Record<string, unknown>,
  inner: Record<string, unknown>,
) => {
  for (const [leaf, value] of Object.entries(inner)) {
    const current = open[leaf];

    open[leaf] =
      isPlainObject(current) && isPlainObject(value)
        ? { ...current, ...value }
        : value;
  }
};

/**
 * Folds same-group conditions into one `$elemMatch`, so they hold for the same
 * entry rather than for any two. Only safe for conditions joined by AND;
 * `canMerge` opts a condition out and leaves it on its own entry.
 */
export const mergePropertyRowConditions = <T extends PropertyFilterQuery>(
  conditions: T[],
  canMerge: (condition: T) => boolean = () => true,
): T[] => {
  const merged: T[] = [];
  const openByPath = new Map<string, Record<string, unknown>>();

  for (const condition of conditions) {
    const clause = canMerge(condition) ? asRowClause(condition) : null;

    if (!clause) {
      merged.push(condition);
      continue;
    }

    const open = openByPath.get(clause.path);

    if (open && canAbsorb(open, clause.inner)) {
      absorb(open, clause.inner);
      continue;
    }

    const inner = { ...clause.inner };

    openByPath.set(clause.path, inner);
    merged.push({ [clause.path]: { $elemMatch: inner } } as T);
  }

  return merged;
};
