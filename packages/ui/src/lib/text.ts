/**
 * A stored value of any JSON shape as text, for showing or editing it.
 * Strings stay as they are, numbers and booleans are printed, objects and arrays become JSON,
 * and null or undefined become ''.
 */
export const textOf = (value: unknown): string => {
  if (value === null || value === undefined) return '';

  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }

  return JSON.stringify(value) ?? '';
};

/**
 * `value` narrowed to one of `options`, else undefined.
 * Use it to turn a select's string into its union type.
 */
export const oneOf = <T extends string>(options: readonly T[], value: string | null) =>
  options.find((option) => option === value);
