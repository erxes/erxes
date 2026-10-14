import type {
  AccountingSettingsFixedAssetsQuery,
  AccountingSettingsFixedAssetsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_FIXED_ASSETS } from '../graphql/queries/fixedAssets';

export const useFixedAssets = (
  options?: QueryHookOptions<
    AccountingSettingsFixedAssetsQuery,
    AccountingSettingsFixedAssetsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_FIXED_ASSETS, options);
  const data = toGraphqlView(queryData);

  return {
    fixedAssets: data?.fixedAssets,
    loading,
    error,
  };
};
