export const normalizeFilterIds = (value?: string | string[] | null) => [
  ...new Set(
    (Array.isArray(value) ? value : [value ?? ''])
      .flatMap((ids) => ids.split(','))
      .map((id) => id.trim())
      .filter(Boolean),
  ),
];
