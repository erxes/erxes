/** `{ field: [before, after] }` for the fields that differ; null when none do. */
export type Changes = Record<string, [unknown, unknown]>;

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

/** The `[name, before, after]` triples whose values differ. */
const diff = (triples: [string, unknown, unknown][]): Changes | null => {
  const changes: Changes = {};

  for (const [name, before, after] of triples) {
    const from = normalize(before);
    const to = normalize(after);

    if (!same(from, to)) {
      changes[name] = [from, to];
    }
  }

  return Object.keys(changes).length ? changes : null;
};

/**
 * Compares `fields` of two versions of a record. Only listed fields are
 * compared, so secrets (password hashes) never end up in a log.
 */
export const diffFields = <T extends object>(
  before: T,
  after: T,
  fields: readonly (keyof T & string)[],
) => diff(fields.map((field) => [field, before[field], after[field]]));

/** Custom field values that changed, keyed `customFields.<fieldId>`. */
export const diffCustomFields = (before: Record<string, unknown>, after: Record<string, unknown>) =>
  diff(
    [...new Set([...Object.keys(before), ...Object.keys(after)])].map((key) => [
      `customFields.${key}`,
      before[key],
      after[key],
    ]),
  );

export const mergeChanges = (...parts: (Changes | null)[]): Changes | null => {
  const merged: Changes = Object.fromEntries(parts.flatMap((part) => Object.entries(part ?? {})));

  return Object.keys(merged).length ? merged : null;
};

/** Every column that differs, except `ignore` (and never password hashes). */
export const diffRows = <T extends Record<string, unknown>>(
  before: T,
  after: T,
  ignore: readonly string[] = [],
) => {
  const skip = new Set(['passwordHash', 'createdAt', 'updatedAt', ...ignore]);

  return diff(
    Object.keys(after)
      .filter((key) => !skip.has(key))
      .map((key) => [key, before[key], after[key]]),
  );
};
