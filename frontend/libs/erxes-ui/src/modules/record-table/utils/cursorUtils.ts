import {
  IRecordTableCursorPageInfo,
  EnumCursorDirection,
} from '../types/RecordTableCursorTypes';

interface ICursorResult<T> {
  pageInfo?: IRecordTableCursorPageInfo;
  list?: T[];
  totalCount?: number;
}

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
