import { OperationVariables, useQuery } from '@apollo/client';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';
import { EnumCursorDirection } from 'erxes-ui';

export const useAdjustClosing = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery(ADJUST_CLOSING_QUERY, {
    ...options,
    variables: { ...options?.variables, page: 1, perPage: ACC_TRS__PER_PAGE },
  });
  const { adjustClosingEntries, pageInfo, adjustClosingCount } = data || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (adjustClosingEntries?.length < adjustClosingCount) {
      fetchMore({
        variables: {
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo.endCursor
              : pageInfo.startCursor,
          limit: ACC_TRS__PER_PAGE,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            ...prev,
            ...fetchMoreResult,
            adjustClosingEntries: [
              ...prev.adjustClosingEntries,
              ...fetchMoreResult.adjustClosingEntries,
            ],
          };
        },
      });
    }
  };

  return {
    adjustClosing: adjustClosingEntries,
    totalCount: data?.adjustClosingCount,
    loading,
    error,
    handleFetchMore,
    pageInfo,
  };
};
