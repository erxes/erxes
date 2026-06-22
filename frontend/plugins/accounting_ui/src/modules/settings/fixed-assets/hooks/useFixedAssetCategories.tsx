import { OperationVariables, useQuery } from '@apollo/client';
import { GET_FIXED_ASSET_CATEGORIES } from '../graphql/queries/fixedAssets';
import { IFixedAssetCategory } from '../types/FixedAsset';

export const useFixedAssetCategories = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    fixedAssetCategories: IFixedAssetCategory[];
  }>(GET_FIXED_ASSET_CATEGORIES, options);

  return {
    fixedAssetCategories: data?.fixedAssetCategories,
    loading,
    error,
  };
};
