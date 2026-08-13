import { OperationVariables, useQuery } from '@apollo/client';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';
import { EnumCursorDirection } from 'erxes-ui';

export const useAdjustClosing = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery(ADJUST_CLOSING_QUERY, {
    ...options,
    variables: { ...options?.variables, page: 1, perPage: ACC_TRS__PER_PAGE },
  });
  const { adjustClosings, pageInfo, adjustClosingsCount } = data || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (adjustClosings?.length < adjustClosingsCount) {
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
            adjustClosings: [
              ...prev.adjustClosing,
              ...fetchMoreResult.adjustClosing,
            ],
          };
        },
      });
    }
  };

  return {
    adjustClosing: adjustClosings,
    totalCount: data?.adjustClosingsCount,
    loading,
    error,
    handleFetchMore,
    pageInfo,
  };
};
