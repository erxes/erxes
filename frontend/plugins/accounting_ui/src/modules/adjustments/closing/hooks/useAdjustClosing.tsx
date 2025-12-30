import { OperationVariables, useQuery } from '@apollo/client';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';

export const useAdjustClosing = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery(ADJUST_CLOSING_QUERY, {
    ...options,
    variables: { ...options?.variables, page: 1, perPage: ACC_TRS__PER_PAGE },
  });
  const { adjustClosing, adjustClosingCount } = data || {};

  const handleFetchMore = () => {
    if (adjustClosing?.length < adjustClosingCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(adjustClosing?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            adjustClosing: [
              ...prev.adjustClosing,
              ...fetchMoreResult.adjustClosing,
            ],
          };
        },
      });
    }
  };

  return {
    adjustClosing: data?.adjustClosing,
    totalCount: data?.adjustClosingCount,
    loading,
    error,
    handleFetchMore,
  };
};
