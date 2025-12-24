export const getStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((val) => typeof val === 'string');
  }
  return [];
};
