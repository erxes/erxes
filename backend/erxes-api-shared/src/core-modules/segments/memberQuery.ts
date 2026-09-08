import { SegmentMongoFilter } from './mongoFilter';

export const DEFAULT_SEGMENT_PAGE_SIZE = 1000;
export const MAX_SEGMENT_PAGE_SIZE = 10000;

export const segmentPageSize = (limit?: number): number =>
  Math.min(limit || DEFAULT_SEGMENT_PAGE_SIZE, MAX_SEGMENT_PAGE_SIZE);

export const segmentPageFilter = (
  filter: SegmentMongoFilter,
  { cursor, ids }: { cursor?: string; ids?: string[] } = {},
): SegmentMongoFilter => {
  const narrowing: SegmentMongoFilter[] = [];

  if (ids) {
    narrowing.push({ _id: { $in: ids } });
  }

  if (cursor) {
    narrowing.push({ _id: { $gt: cursor } });
  }

  if (!narrowing.length) {
    return filter;
  }

  return Object.keys(filter).length
    ? { $and: [filter, ...narrowing] }
    : narrowing.length === 1
      ? narrowing[0]
      : { $and: narrowing };
};

export const segmentPage = (
  ids: string[],
  limit: number,
): { ids: string[]; nextCursor?: string } => {
  if (ids.length <= limit) {
    return { ids };
  }

  const page = ids.slice(0, limit);

  return { ids: page, nextCursor: page[page.length - 1] };
};
