import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
} from 'erxes-ui';

type GqlPageInfo = {
  hasNextPage: boolean | null;
  hasPreviousPage: boolean | null;
  startCursor: string | null;
  endCursor: string | null;
};

type GqlCursorList<T> = {
  list: (T | null)[] | null;
  pageInfo: GqlPageInfo | null;
  totalCount: number | null;
};

// The shared PageInfo SDL declares its booleans nullable; the record table
// helpers need them as booleans.
export const toCursorPageInfo = (
  pageInfo: GqlPageInfo | null | undefined,
): IRecordTableCursorPageInfo | undefined =>
  pageInfo
    ? {
        ...pageInfo,
        hasNextPage: pageInfo.hasNextPage ?? false,
        hasPreviousPage: pageInfo.hasPreviousPage ?? false,
      }
    : undefined;

export const compactList = <T>(
  list: readonly (T | null)[] | null | undefined,
) => (list ?? []).filter((item): item is T => item !== null);

export const mergeCursorList = <T, L extends GqlCursorList<T>>(
  direction: EnumCursorDirection,
  prev: L,
  next: L,
): L => {
  const merged = mergeCursorData({
    direction,
    fetchMoreResult: {
      list: next.list ?? [],
      pageInfo: toCursorPageInfo(next.pageInfo),
    },
    prevResult: {
      list: prev.list ?? [],
      pageInfo: toCursorPageInfo(prev.pageInfo),
    },
  });

  return {
    ...next,
    list: merged.list,
    pageInfo: {
      hasNextPage: merged.pageInfo.hasNextPage,
      hasPreviousPage: merged.pageInfo.hasPreviousPage,
      startCursor: merged.pageInfo.startCursor ?? null,
      endCursor: merged.pageInfo.endCursor ?? null,
    },
  };
};
