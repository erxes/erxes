import {
  IRecordTableCursorPageInfo,
  EnumCursorDirection,
} from '../types/RecordTableCursorTypes';

interface ICursorResult<T> {
  pageInfo?: IRecordTableCursorPageInfo;
  list?: T[];
  totalCount?: number;
}

/**
 * A string that has been checked by `isValidCursor`. The brand keeps the
 * narrowing honest: passing `isValidCursor` yields a `Cursor`, not a bare
 * `string`, so an unchecked string cannot be mistaken for a validated one.
 */
export type Cursor = string & { readonly __cursor: unique symbol };

/**
 * A valid cursor is base64(JSON) carrying at least an `_id`, matching the
 * server's encodeCursor/decodeCursor. A raw row id or any other leftover value
 * is rejected server-side as "Invalid cursor format", which errors the list
 * query and leaves the table permanently blank. Treat anything that is not an
 * opaque cursor as "no cursor" so the table falls back to the first page.
 */
export const isValidCursor = (value: string | null): value is Cursor => {
  if (!value) return false;

  try {
    const decoded = JSON.parse(atob(value));
    return typeof decoded === 'object' && decoded !== null && '_id' in decoded;
  } catch {
    return false;
  }
};

export const mergeCursorData = <T>({
  direction,
  fetchMoreResult,
  prevResult,
}: {
  direction: EnumCursorDirection;
  fetchMoreResult: ICursorResult<T>;
  prevResult: ICursorResult<T>;
}) => {
  const isForward = direction === EnumCursorDirection.FORWARD;
  const fetchPageInfo =
    fetchMoreResult?.pageInfo || ({} as IRecordTableCursorPageInfo);
  const prevPageInfo =
    prevResult?.pageInfo || ({} as IRecordTableCursorPageInfo);

  const fetchList = fetchMoreResult?.list || [];
  const prevList = prevResult?.list || [];

  return {
    ...fetchMoreResult,
    list: isForward ? [...prevList, ...fetchList] : [...fetchList, ...prevList],
    pageInfo: {
      endCursor: isForward ? fetchPageInfo.endCursor : prevPageInfo.endCursor,
      hasNextPage: isForward
        ? fetchPageInfo.hasNextPage
        : prevPageInfo.hasNextPage,
      hasPreviousPage: isForward
        ? prevPageInfo.hasPreviousPage
        : fetchPageInfo.hasPreviousPage,
      startCursor: isForward
        ? prevPageInfo.startCursor
        : fetchPageInfo.startCursor,
    },
  };
};

export const validateFetchMore = ({
  direction,
  pageInfo,
}: {
  direction: EnumCursorDirection;
  pageInfo?: IRecordTableCursorPageInfo;
}) => {
  if (!pageInfo) return false;

  if (direction === EnumCursorDirection.FORWARD && pageInfo?.hasNextPage) {
    return true;
  }

  if (direction === EnumCursorDirection.BACKWARD && pageInfo?.hasPreviousPage) {
    return true;
  }

  return false;
};
