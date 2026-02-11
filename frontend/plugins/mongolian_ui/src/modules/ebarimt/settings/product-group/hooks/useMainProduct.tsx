import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_MAIN_PRODUCT } from '@/ebarimt/settings/product-group/graphql/queries/mainProduct';

export const useGetMainProduct = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_MAIN_PRODUCT, {
    ...options,
  });

  const mainProduct = data?.products || [];

  return {
    mainProduct,
    loading,
    error,
  };
};
