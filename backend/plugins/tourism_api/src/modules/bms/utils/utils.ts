export const getEnum = (
  options: { label: string; value: string }[],
): string[] => {
  return options.map((option) => option.value);
};
