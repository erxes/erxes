export const toIds = (
  value: string | string[] | null | undefined,
): string[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
};
