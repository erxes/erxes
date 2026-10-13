export const toggleFilterValue = <T extends string | number>(
  values: T[],
  value: T,
): T[] =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

export const toFilterIds = (value: string | string[] | null): string[] =>
  Array.isArray(value) ? value : value ? [value] : [];
