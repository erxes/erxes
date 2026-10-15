import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
} from 'erxes-ui';

import type { SalesDealListQuery } from '~/gql/graphql';

type GqlPageInfo = NonNullable<
  NonNullable<SalesDealListQuery['deals']>['pageInfo']
>;

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
    totalCount: next.totalCount ?? prev.totalCount,
    pageInfo: {
      hasNextPage: merged.pageInfo.hasNextPage,
      hasPreviousPage: merged.pageInfo.hasPreviousPage,
      startCursor: merged.pageInfo.startCursor ?? null,
      endCursor: merged.pageInfo.endCursor ?? null,
    },
  };
};
