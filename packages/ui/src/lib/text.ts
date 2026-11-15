/**
 * A stored value of any JSON shape as text: strings as they are, numbers and
 * booleans printed, objects and arrays as JSON, nothing as ''.
 */
export const textOf = (value: unknown): string => {
  if (value === null || value === undefined) return '';

  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }

  return JSON.stringify(value) ?? '';
};

/** `value` when it is one of `options` (a select's string as its union type), else undefined. */
export const oneOf = <T extends string>(options: readonly T[], value: string | null) =>
  options.find((option) => option === value);
