/** True for `null` and `undefined`, and narrows the value's type. */
export const isUndefinedOrNull = (value: unknown): value is null | undefined =>
  value === undefined || value === null;
