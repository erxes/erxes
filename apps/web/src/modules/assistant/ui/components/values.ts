export const textOf = (value: unknown) => {
  if (typeof value === 'string') return value;

  return typeof value === 'number' ? String(value) : '';
};

export const optionalText = (value: unknown) => textOf(value) || undefined;

export const listOf = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
