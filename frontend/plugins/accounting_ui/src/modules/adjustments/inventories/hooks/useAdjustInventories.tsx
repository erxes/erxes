import { ADJUST_INVENTORIES_QUERY } from '../graphql/adjustInventoryQueries';
import { OperationVariables, useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '../../../transactions/types/constants';

export const useAdjustInventories = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery(
    ADJUST_INVENTORIES_QUERY,
    {
      ...options,
      variables: {
        ...options?.variables,
        page: 1,
        perPage: ACC_TRS__PER_PAGE,
      },
    }
  );
  const { adjustInventories, adjustInventoriesCount } = data || {};

  const handleFetchMore = () => {
    if (adjustInventories?.length < adjustInventoriesCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(adjustInventories?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            adjustInventories: [...prev.adjustInventories, ...fetchMoreResult.adjustInventories],
          };
        },
      });
    }
  };

  return {
    adjustInventories: data?.adjustInventories,
    totalCount: data?.adjustInventoriesCount,
    loading,
    error,
    handleFetchMore,
  };
};
