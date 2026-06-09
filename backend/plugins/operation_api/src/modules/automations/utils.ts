export type TOperationEventUpdateDescription = {
  updated: Record<string, { prev: unknown; current: unknown }>;
};

const STATIC_REFERENCE_TOKEN_REGEXP =
  /^\[\[\s*(?:task|project|team|milestone|status|user)\.([^\]]+?)\s*\]\]$/;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const toRecord = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {};

const unwrapStaticReferenceToken = (value: string) => {
  const match = value.match(STATIC_REFERENCE_TOKEN_REGEXP);

  return match?.[1]?.trim() || value;
};

export const getString = (
  data: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = data[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  const stringValue = String(value).trim();

  return stringValue ? unwrapStaticReferenceToken(stringValue) : undefined;
};

export const getNumber = (
  data: Record<string, unknown>,
  key: string,
): number | undefined => {
  const value = data[key];

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

export const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(toStringList);
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => unwrapStaticReferenceToken(item.trim()))
    .filter(Boolean);
};

export const getAutomationUserId = (
  data: Record<string, unknown>,
  target: Record<string, unknown>,
) =>
  getString(data, 'createdBy') ||
  getString(data, 'userId') ||
  getString(target, 'userId') ||
  getString(target, 'createdBy');

const normalizeUpdateValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeUpdateValue).sort();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object') {
    return String(value);
  }

  return value;
};

const isSameUpdateValue = (left: unknown, right: unknown) =>
  JSON.stringify(normalizeUpdateValue(left)) ===
  JSON.stringify(normalizeUpdateValue(right));

export const buildEventUpdateDescription = (
  previous: unknown,
  current: unknown,
  fields: string[],
): TOperationEventUpdateDescription | undefined => {
  const previousRecord = toRecord(previous);
  const currentRecord = toRecord(current);
  const updated: Record<string, { prev: unknown; current: unknown }> = {};

  for (const field of fields) {
    const prev = previousRecord[field];
    const current = currentRecord[field];

    if (!isSameUpdateValue(prev, current)) {
      updated[field] = {
        prev,
        current,
      };
    }
  }

  return Object.keys(updated).length ? { updated } : undefined;
};
