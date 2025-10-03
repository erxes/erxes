import { useQuery, OperationVariables } from '@apollo/client';
import { ADJUST_INVENTORY_DETAILS_QUERY } from '../graphql/adjustInventoryQueries';
import { IAdjustInvDetail } from '../types/AdjustInventory';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useAdjustInventoryDetails = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery<
    { adjustInventoryDetails: IAdjustInvDetail[], adjustInventoryDetailsCount: number },
    OperationVariables
  >(ADJUST_INVENTORY_DETAILS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });
  const { adjustInventoryDetails = [], adjustInventoryDetailsCount = 0 } = data || {};

  const handleFetchMore = () => {
    if (adjustInventoryDetails?.length < adjustInventoryDetailsCount) {
      fetchMore({
        variables: {
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(adjustInventoryDetails?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            adjustInventoryDetails: [...prev.adjustInventoryDetails, ...fetchMoreResult.adjustInventoryDetails],
          };
        },
      });
    }
  };

  return {
    adjustInventoryDetails,
    adjustInventoryDetailsCount,
    handleFetchMore,
    loading,
    error,
  };
};
