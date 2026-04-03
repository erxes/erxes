import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_EXCLUDE_CATEGORIES } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/excludeCategories';

export const useGetExcludeCategories = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_EXCLUDE_CATEGORIES, {
    ...options,
  });

  const excludeCategories = data?.productCategories || [];

  return {
    excludeCategories,
    loading,
    error,
  };
};
