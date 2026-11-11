import type { Changes } from '@erxes/core-contract';

type Values = Record<string, unknown>;

const normalize = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value === undefined || value === '') {
    return null;
  }

  return value;
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Compares `fields` of two versions of a record; null when none differ. Only
 * listed fields are compared, so secrets (password hashes) never end up in a log.
 */
export const diffFields = (
  before: Values,
  after: Values,
  fields: Iterable<string>,
  prefix = '',
): Changes | null => {
  const changes: Changes = {};

  for (const field of fields) {
    const from = normalize(before[field]);
    const to = normalize(after[field]);

    if (!same(from, to)) {
      changes[`${prefix}${field}`] = [from, to];
    }
  }

  return Object.keys(changes).length ? changes : null;
};

/** Custom field values that changed, keyed `customFields.<fieldId>`. */
export const diffCustomFields = (before: Values, after: Values) =>
  diffFields(
    before,
    after,
    new Set([...Object.keys(before), ...Object.keys(after)]),
    'customFields.',
  );

export const mergeChanges = (...parts: (Changes | null)[]): Changes | null => {
  const merged: Changes = {};

  for (const part of parts) {
    if (part) Object.assign(merged, part);
  }

  return Object.keys(merged).length ? merged : null;
};

/** Every column that differs, except `ignore` (and never password hashes). */
export const diffRows = (before: Values, after: Values, ignore: readonly string[] = []) => {
  const skip = new Set(['passwordHash', 'createdAt', 'updatedAt', ...ignore]);

  return diffFields(
    before,
    after,
    Object.keys(after).filter((key) => !skip.has(key)),
  );
};
