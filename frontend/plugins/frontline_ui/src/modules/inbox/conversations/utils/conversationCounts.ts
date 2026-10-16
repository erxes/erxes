import { isRecord } from '@/shared/utils/isRecord';

/** `conversationCounts` is JSON; numbers keyed by id, kind, or filter name. */
export const readCountMap = (
  counts: unknown,
  key: string,
): Record<string, number> => {
  const value = isRecord(counts) ? counts[key] : undefined;

  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] => typeof entry[1] === 'number',
    ),
  );
};

export const readCount = (counts: unknown, key: string): number | undefined => {
  const value = isRecord(counts) ? counts[key] : undefined;

  return typeof value === 'number' ? value : undefined;
};
