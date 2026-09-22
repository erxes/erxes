import { OperationVariables, useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { ADJUST_FIXED_ASSETS_QUERY } from '../graphql/adjustFixedAssetQueries';
import { IAdjustFixedAsset } from '../types/AdjustFixedAsset';

export const useAdjustFixedAssets = (options?: OperationVariables) => {
  const { data, loading, error, fetchMore } = useQuery<{
    adjustFixedAssets: IAdjustFixedAsset[];
    adjustFixedAssetsCount: number;
  }>(ADJUST_FIXED_ASSETS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
    },
  });

  const adjustFixedAssets = data?.adjustFixedAssets || [];
  const totalCount = data?.adjustFixedAssetsCount || 0;

  const handleFetchMore = () => {
    if (adjustFixedAssets.length >= totalCount) {
      return;
    }

    fetchMore({
      variables: {
        perPage: ACC_TRS__PER_PAGE,
        page: Math.ceil(adjustFixedAssets.length / ACC_TRS__PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => ({
        ...prev,
        ...fetchMoreResult,
        adjustFixedAssets: [
          ...prev.adjustFixedAssets,
          ...fetchMoreResult.adjustFixedAssets,
        ],
      }),
    });
  };

  return {
    adjustFixedAssets,
    totalCount,
    loading,
    error,
    handleFetchMore,
  };
};
