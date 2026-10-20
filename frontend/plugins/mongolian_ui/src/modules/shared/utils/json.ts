export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// JSON scalar items are pass-through records from external ERPs (MS Dynamics,
// Erkhet) or values this plugin's settings forms saved. This is the single
// place the UI asserts their shape.
export const jsonArray = (value: unknown): readonly unknown[] =>
  Array.isArray(value) ? value : [];

export const jsonRecords = <T extends object>(
  items: readonly unknown[] | null | undefined,
): T[] => (items ?? []).filter(isRecord) as T[];

export const jsonRecord = <T extends object>(value: unknown): T | undefined =>
  isRecord(value) ? (value as T) : undefined;
