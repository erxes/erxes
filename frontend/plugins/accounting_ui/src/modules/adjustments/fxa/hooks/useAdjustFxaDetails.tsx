import { OperationVariables, useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { ADJUST_FXA_DETAILS_QUERY } from '../graphql/adjustFixedAssetQueries';
import { IAdjustFxaDetail } from '../types/AdjustFixedAsset';

export const useAdjustFxaDetails = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery<{
    adjustFxaDetails: IAdjustFxaDetail[];
    adjustFxaDetailsCount: number;
  }>(ADJUST_FXA_DETAILS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });

  const adjustFxaDetails = data?.adjustFxaDetails || [];
  const adjustFxaDetailsCount = data?.adjustFxaDetailsCount || 0;

  const handleFetchMore = () => {
    if (adjustFxaDetails.length >= adjustFxaDetailsCount) {
      return;
    }

    fetchMore({
      variables: {
        perPage: ACC_TRS__PER_PAGE,
        page: Math.ceil(adjustFxaDetails.length / ACC_TRS__PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => ({
        ...prev,
        ...fetchMoreResult,
        adjustFxaDetails: [
          ...prev.adjustFxaDetails,
          ...fetchMoreResult.adjustFxaDetails,
        ],
      }),
    });
  };

  return {
    adjustFxaDetails,
    adjustFxaDetailsCount,
    loading,
    error,
    handleFetchMore,
  };
};
