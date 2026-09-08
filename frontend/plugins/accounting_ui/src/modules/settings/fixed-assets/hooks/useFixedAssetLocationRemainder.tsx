import { OperationVariables, useQuery } from '@apollo/client';
import { GET_FIXED_ASSET_LOCATION_REMAINDER } from '../graphql/queries/fixedAssets';

type TFixedAssetLocationRemainder = {
  fixedAssetId: string;
  branchId?: string;
  departmentId?: string;
  remainder: number;
};

export const useFixedAssetLocationRemainder = (
  options?: OperationVariables,
) => {
  const { data, loading, error } = useQuery<{
    fixedAssetLocationRemainder?: TFixedAssetLocationRemainder;
  }>(GET_FIXED_ASSET_LOCATION_REMAINDER, options);

  return {
    fixedAssetLocationRemainder: data?.fixedAssetLocationRemainder,
    loading,
    error,
  };
};
