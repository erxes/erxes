export const getValidCustomFieldOptions = (options: unknown): string[] => {
  if (!Array.isArray(options)) return [];

  return options.filter(
    (option: unknown): option is string =>
      typeof option === 'string' && option.trim().length > 0,
  );
};
