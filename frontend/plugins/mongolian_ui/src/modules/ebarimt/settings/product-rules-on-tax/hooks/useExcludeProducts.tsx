import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_EXCLUDE_PRODUCTS } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/excludeProducts';

export const useGetExcludeProducts = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_EXCLUDE_PRODUCTS, {
    ...options,
  });

  const excludeProducts = data?.products || [];

  return {
    excludeProducts,
    loading,
    error,
  };
};
