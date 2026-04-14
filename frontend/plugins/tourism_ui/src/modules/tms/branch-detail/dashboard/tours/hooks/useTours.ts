import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { GET_TOURS } from '../graphql/queries';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';
import { ITour } from '../types/tour';
import { tourTotalCountAtom } from '../states/tourCounts';

const TOURS_PER_PAGE = 30;

type ToursQueryVariables = {
  branchId?: string;
  name?: string;
  status?: string;
  date_status?:
    | 'running'
    | 'completed'
    | 'scheduled'
    | 'cancelled'
    | 'unscheduled';
  categoryIds?: string[];
  language?: string;
  limit?: number;
  cursor?: string;
  direction?: EnumCursorDirection;
  orderBy?: Record<string, number>;
};

export const useTours = (
  options?: QueryHookOptions<
    {
      bmsTours: {
        list: ITour[];
        totalCount: number;
        pageInfo: IRecordTableCursorPageInfo;
      };
    },
    ToursQueryVariables
  >,
) => {
  const setTourTotalCount = useSetAtom(tourTotalCountAtom);

  const [{ searchValue, status, date_status, categoryIds }] =
    useMultiQueryState<{
      searchValue: string;
      status: string;
      date_status:
        | 'running'
        | 'completed'
        | 'scheduled'
        | 'cancelled'
        | 'unscheduled';
      categoryIds: string;
    }>(['searchValue', 'status', 'date_status', 'categoryIds']);

  const { cursor } = useRecordTableCursor({
    sessionKey: TOURS_CURSOR_SESSION_KEY,
  });

  const variables: ToursQueryVariables = {
    orderBy: { createdAt: -1 },
    ...(options?.variables || {}),
    name: searchValue || undefined,
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

  const { list: tours, totalCount, pageInfo } = data?.bmsTours || {};

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
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          bmsTours: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.bmsTours,
            prevResult: prev.bmsTours,
          }),
        });
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
