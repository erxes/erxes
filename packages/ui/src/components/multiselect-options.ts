export interface MultiSelectOption {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}

/** Options by group heading; '' holds the ungrouped ones. */
export type GroupedOptions = Record<string, MultiSelectOption[]>;

export const groupOptions = (options: MultiSelectOption[], groupBy?: string): GroupedOptions => {
  if (!groupBy) {
    return options.length > 0 ? { '': options } : {};
  }

  const groups: GroupedOptions = {};

  for (const option of options) {
    const key = option[groupBy];

    (groups[typeof key === 'string' ? key : ''] ??= []).push(option);
  }

  return groups;
};

export const withoutPicked = (groups: GroupedOptions, picked: MultiSelectOption[]) =>
  Object.fromEntries(
    Object.entries(groups).map(([key, options]) => [
      key,
      options.filter((option) => !picked.some((item) => item.value === option.value)),
    ]),
  );

export const hasOptionValue = (groups: GroupedOptions, value: string) =>
  Object.values(groups).some((options) => options.some((option) => option.value === value));
