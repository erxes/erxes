import { OperationVariables, useQuery } from '@apollo/client';
import { ADJUST_FIXED_ASSET_DETAIL_QUERY } from '../graphql/adjustFixedAssetQueries';
import { IAdjustFixedAsset } from '../types/AdjustFixedAsset';

export const useAdjustFixedAssetDetail = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    adjustFixedAssetDetail?: IAdjustFixedAsset;
  }>(ADJUST_FIXED_ASSET_DETAIL_QUERY, options);

  return {
    adjustFixedAsset: data?.adjustFixedAssetDetail,
    loading,
    error,
  };
};
