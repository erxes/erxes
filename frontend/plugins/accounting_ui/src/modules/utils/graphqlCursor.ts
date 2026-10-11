import { EnumCursorDirection, mergeCursorData } from 'erxes-ui';

type NullablePageInfo = {
  hasNextPage?: boolean | null;
  hasPreviousPage?: boolean | null;
  startCursor?: string | null;
  endCursor?: string | null;
};

export const toCursorPageInfo = (pageInfo?: NullablePageInfo | null) => ({
  hasNextPage: pageInfo?.hasNextPage ?? false,
  hasPreviousPage: pageInfo?.hasPreviousPage ?? false,
  startCursor: pageInfo?.startCursor ?? undefined,
  endCursor: pageInfo?.endCursor ?? undefined,
});

type NullableCursorResult<T> = {
  list?: (T | null)[] | null;
  totalCount?: number | null;
  pageInfo?: NullablePageInfo | null;
};

// Adapt at the Apollo boundary; keep the platform's cursor ordering behavior.
export const mergeGraphqlCursorData = <T>({
  direction,
  fetchMoreResult,
  prevResult,
}: {
  direction: EnumCursorDirection;
  fetchMoreResult?: NullableCursorResult<T> | null;
  prevResult?: NullableCursorResult<T> | null;
}) => {
  const normalize = (result?: NullableCursorResult<T> | null) => ({
    list: (result?.list ?? []).filter((item): item is T => item !== null),
    totalCount: result?.totalCount ?? 0,
    pageInfo: toCursorPageInfo(result?.pageInfo),
  });
  const merged = mergeCursorData({
    direction,
    fetchMoreResult: normalize(fetchMoreResult),
    prevResult: normalize(prevResult),
  });
  return {
    ...merged,
    totalCount: merged.totalCount ?? 0,
    pageInfo: {
      ...merged.pageInfo,
      startCursor: merged.pageInfo.startCursor ?? null,
      endCursor: merged.pageInfo.endCursor ?? null,
    },
  };
};
