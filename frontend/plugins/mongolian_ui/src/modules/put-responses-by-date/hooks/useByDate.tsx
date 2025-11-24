import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useMemo } from 'react';

import { byDateQueries } from '@/put-responses-by-date/graphql/ByDateQueries';
import { IByDate } from '@/put-responses-by-date/types/ByDateType';
import { BY_DATE_CURSOR_SESSION_KEY } from '@/put-responses-by-date/constants/ByDateCursorSessionKey';

export const BY_DATE_PER_PAGE = 30;

interface IByDateResponse {
  putResponsesByDate: IByDate[];
}

export const useByDate = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: BY_DATE_CURSOR_SESSION_KEY,
  });

  const { data, loading, fetchMore } = useQuery<IByDateResponse>(
    byDateQueries.putResponsesByDate,
    {
      ...options,
      variables: {
        limit: BY_DATE_PER_PAGE,
        cursor,
        ...options?.variables,
      },
    },
  );

  const { byDate, pageInfo } = useMemo(() => {
    const responseData = data?.putResponsesByDate || [];

    return {
      byDate: Array.isArray(responseData) ? responseData : [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      } as IRecordTableCursorPageInfo,
    };
  }, [data]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!pageInfo) return;

    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: BY_DATE_PER_PAGE,
        direction,
        ...options?.variables,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const newItems = Array.isArray(fetchMoreResult.putResponsesByDate)
          ? fetchMoreResult.putResponsesByDate
          : [];

        return {
          ...prev,
          putResponsesByDate: [
            ...(Array.isArray(prev.putResponsesByDate)
              ? prev.putResponsesByDate
              : []),
            ...newItems,
          ],
        };
      },
    });
  };

  return {
    loading,
    byDate,
    totalCount: byDate.length,
    handleFetchMore,
    pageInfo,
  };
};
