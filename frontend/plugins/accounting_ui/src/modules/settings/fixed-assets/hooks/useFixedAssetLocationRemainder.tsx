import type {
  AccountingFixedAssetLocationRemainderQuery,
  AccountingFixedAssetLocationRemainderQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_FIXED_ASSET_LOCATION_REMAINDER } from '../graphql/queries/fixedAssets';

export const useFixedAssetLocationRemainder = (
  options?: QueryHookOptions<
    AccountingFixedAssetLocationRemainderQuery,
    AccountingFixedAssetLocationRemainderQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_FIXED_ASSET_LOCATION_REMAINDER, options);
  const data = toGraphqlView(queryData);

  return {
    fixedAssetLocationRemainder: data?.fixedAssetLocationRemainder,
    loading,
    error,
  };
};
