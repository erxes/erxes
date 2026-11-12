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
