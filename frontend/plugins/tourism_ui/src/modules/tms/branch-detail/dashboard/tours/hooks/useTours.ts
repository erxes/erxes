import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { GET_TOURS } from '../graphql/queries';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';
import { tourTotalCountAtom } from '../states/tourCounts';
import type {
  BmsToursQuery,
  BmsToursQueryVariables,
  Date_Status,
} from '~/gql/graphql';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '~/utils/cursorList';

const TOURS_PER_PAGE = 30;

export const useTours = (
  options?: QueryHookOptions<BmsToursQuery, BmsToursQueryVariables>,
) => {
  const setTourTotalCount = useSetAtom(tourTotalCountAtom);

  const [{ tourSearchValue, status, date_status, categoryIds }] =
    useMultiQueryState<{
      tourSearchValue: string;
      status: string;
      date_status: Date_Status;
      categoryIds: string;
    }>(['tourSearchValue', 'status', 'date_status', 'categoryIds']);

  const { cursor } = useRecordTableCursor({
    sessionKey: TOURS_CURSOR_SESSION_KEY,
  });

  const normalizedTourSearchValue = tourSearchValue
    ? String(tourSearchValue)
    : undefined;

  const variables: BmsToursQueryVariables = {
    orderBy: { createdAt: -1 },
    ...(options?.variables || {}),
    name: normalizedTourSearchValue,
    status: status || undefined,
    date_status: date_status || undefined,
    categoryIds: categoryIds
      ? categoryIds.split(',').filter(Boolean)
      : undefined,
    cursor,
    limit: TOURS_PER_PAGE,
  };

  const { data, loading, error, fetchMore } = useQuery(GET_TOURS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const list = data?.bmsTours?.list;
  const tours = useMemo(() => (list ? compactList(list) : undefined), [list]);
  const totalCount = data?.bmsTours?.totalCount;
  const pageInfo = toCursorPageInfo(data?.bmsTours?.pageInfo);

  useEffect(() => {
    setTourTotalCount(totalCount ?? null);
  }, [totalCount, setTourTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: TOURS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.bmsTours || !prev.bmsTours) return prev;

        return {
          ...prev,
          bmsTours: mergeCursorList(
            direction,
            prev.bmsTours,
            fetchMoreResult.bmsTours,
          ),
        };
      },
    });
  };

  return {
    loading,
    error,
    tours,
    totalCount,
    pageInfo,
    handleFetchMore,
  };
};
