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

/**
 * Compares `fields` of two versions of a record. Only listed fields are
 * compared, so secrets (password hashes) never end up in a log.
 */
export const diffFields = <T extends object>(
  before: T,
  after: T,
  fields: readonly (keyof T & string)[],
): Changes | null => {
  const changes: Changes = {};

  for (const field of fields) {
    const from = normalize(before[field]);
    const to = normalize(after[field]);

    if (!same(from, to)) {
      changes[field] = [from, to];
    }
  }

  return Object.keys(changes).length ? changes : null;
};

/** Custom field values that changed, keyed `customFields.<fieldId>`. */
export const diffCustomFields = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Changes | null => {
  const changes: Changes = {};

  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const from = normalize(before[key]);
    const to = normalize(after[key]);

    if (!same(from, to)) {
      changes[`customFields.${key}`] = [from, to];
    }
  }

  return Object.keys(changes).length ? changes : null;
};

export const mergeChanges = (...parts: (Changes | null)[]): Changes | null => {
  const merged = Object.assign({}, ...parts.filter(Boolean)) as Changes;

  return Object.keys(merged).length ? merged : null;
};

/** Every column that differs, except `ignore` (and never password hashes). */
export const diffRows = <T extends object>(
  before: T,
  after: T,
  ignore: readonly string[] = [],
): Changes | null => {
  const skip = new Set(['passwordHash', 'createdAt', 'updatedAt', ...ignore]);
  const fields = Object.keys(after).filter((key) => !skip.has(key)) as (keyof T & string)[];

  return diffFields(before, after, fields);
};
