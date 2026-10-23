const toCostNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return Number.NaN;
};

export const toPersonCost = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, cost]): [string, number] => [key, toCostNumber(cost)])
      .filter(([, cost]) => !Number.isNaN(cost)),
  );
};
