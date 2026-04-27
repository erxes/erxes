import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_PRODUCTS } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/products';

export const useGetProducts = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    ...options,
  });

  const products = data?.products || [];

  return {
    products,
    loading,
    error,
  };
};
