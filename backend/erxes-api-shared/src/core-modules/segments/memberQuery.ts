import { SegmentMongoFilter } from './mongoFilter';

/**
 * Cursor paging for segment member lists.
 *
 * Paging on `_id` rather than a skip keeps every page one index seek deep, so a
 * catch-up scan over millions of records costs the same on the last page as on
 * the first.
 */

export const DEFAULT_SEGMENT_PAGE_SIZE = 1000;
export const MAX_SEGMENT_PAGE_SIZE = 10000;

export const segmentPageSize = (limit?: number): number =>
  Math.min(limit || DEFAULT_SEGMENT_PAGE_SIZE, MAX_SEGMENT_PAGE_SIZE);

/**
 * Narrows a filter to the records after `cursor`, in `_id` order, and to `ids`
 * when the caller only cares about a known set - which is how one record is
 * checked for membership without listing the segment.
 */
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

/**
 * Splits a page off an over-fetched result. Reading `limit + 1` rows is what
 * tells the caller whether another page exists without a second count.
 */
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
