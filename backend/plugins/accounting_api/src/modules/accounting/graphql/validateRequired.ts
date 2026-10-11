export function validateRequiredId(
  value: unknown,
  name = '_id',
): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} must not be empty`);
  }
}

export function validateRequiredIds(
  values: unknown,
  name: string,
): asserts values is string[] {
  if (!Array.isArray(values) || !values.length) {
    throw new Error(`${name} must contain at least one id`);
  }
  for (const value of values) validateRequiredId(value, name);
}
