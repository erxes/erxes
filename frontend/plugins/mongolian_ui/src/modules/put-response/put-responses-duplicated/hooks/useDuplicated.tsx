import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useMemo } from 'react';

import { duplicatedQueries } from '@/put-response/put-responses-duplicated/graphql/DuplicatedQueries';
import { IDuplicated } from '@/put-response/put-responses-duplicated/types/DuplicatedType';
import { DUPLICATED_CURSOR_SESSION_KEY } from '@/put-response/put-responses-duplicated/constants/DuplicatedCursorSessionKey';

export const DUPLICATED_PER_PAGE = 30;

interface IDuplicatedResponse {
  putResponsesDuplicated: IDuplicated[];
}

export const useDuplicated = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: DUPLICATED_CURSOR_SESSION_KEY,
  });

  const { data, loading, fetchMore } = useQuery<IDuplicatedResponse>(
    duplicatedQueries.putResponsesDuplicated,
    {
      ...options,
      variables: {
        limit: DUPLICATED_PER_PAGE,
        cursor,
        ...options?.variables,
      },
    },
  );

  const { putResponsesDuplicated, pageInfo } = useMemo(() => {
    const responseData = data?.putResponsesDuplicated || [];

    return {
      putResponsesDuplicated: Array.isArray(responseData) ? responseData : [],
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
        limit: DUPLICATED_PER_PAGE,
        direction,
        ...options?.variables,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const newItems = Array.isArray(fetchMoreResult.putResponsesDuplicated)
          ? fetchMoreResult.putResponsesDuplicated
          : [];

        return {
          ...prev,
          putResponsesDuplicated: [
            ...(Array.isArray(prev.putResponsesDuplicated)
              ? prev.putResponsesDuplicated
              : []),
            ...newItems,
          ],
        };
      },
    });
  };

  return {
    loading,
    putResponsesDuplicated,
    totalCount: putResponsesDuplicated.length,
    handleFetchMore,
    pageInfo,
  };
};
