import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import {
  GET_POLL_LIST,
  GET_POLL_RESULTS_LIST,
} from '@/poll/graphql/pollQueries';
import { IPoll } from '@/poll/types/pollTypes';

const POLLS_PER_PAGE = 24;

export const usePollList = (
  options?: QueryHookOptions & { withResults?: boolean },
) => {
  const { withResults, ...queryOptions } = options || {};

  const { data, loading, error, fetchMore, refetch } = useQuery(
    withResults ? GET_POLL_RESULTS_LIST : GET_POLL_LIST,
    {
      ...queryOptions,
      variables: {
        limit: POLLS_PER_PAGE,
        ...queryOptions?.variables,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const {
    list: polls,
    totalCount,
    pageInfo,
  } = data?.pollList || ({} as { list?: IPoll[] });

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.BACKWARD
            ? pageInfo?.startCursor
            : pageInfo?.endCursor,
        limit: POLLS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          pollList: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.pollList,
            prevResult: prev.pollList,
          }),
        });
      },
    });
  };

  return {
    polls: polls as IPoll[] | undefined,
    loading,
    error,
    totalCount,
    pageInfo,
    handleFetchMore,
    refetch,
  };
};
