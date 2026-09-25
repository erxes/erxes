import { OperationVariables, useQuery } from '@apollo/client';
import { GET_FIXED_ASSETS } from '../graphql/queries/fixedAssets';
import { IFixedAsset } from '../types/FixedAsset';

export const useFixedAssets = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    fixedAssets: IFixedAsset[];
  }>(GET_FIXED_ASSETS, options);

  return {
    fixedAssets: data?.fixedAssets,
    loading,
    error,
  };
};
