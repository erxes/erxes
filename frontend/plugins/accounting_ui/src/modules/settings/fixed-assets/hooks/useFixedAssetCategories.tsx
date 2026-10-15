import type {
  AccountingFixedAssetCategoriesQuery,
  AccountingFixedAssetCategoriesQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_FIXED_ASSET_CATEGORIES } from '../graphql/queries/fixedAssets';

export const useFixedAssetCategories = (
  options?: QueryHookOptions<
    AccountingFixedAssetCategoriesQuery,
    AccountingFixedAssetCategoriesQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_FIXED_ASSET_CATEGORIES, options);
  const data = toGraphqlView(queryData);

  return {
    fixedAssetCategories: data?.fixedAssetCategories,
    loading,
    error,
  };
};
