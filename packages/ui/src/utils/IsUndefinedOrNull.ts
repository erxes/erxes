export const isUndefinedOrNull = (value: unknown): value is null | undefined =>
  value === undefined || value === null;
