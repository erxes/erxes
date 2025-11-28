import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_SUB_PRODUCT } from '@/ebarimt/settings/product-group/graphql/queries/subProduct';

export const useGetSubProduct = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_SUB_PRODUCT, {
    ...options,
  });

  const subProducts = data?.products || [];

  return {
    subProducts,
    loading,
    error,
  };
};
