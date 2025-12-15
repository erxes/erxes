import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_PRODUCT_CATEGORIES } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/productCategories';

export const useGetProductCategories = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_PRODUCT_CATEGORIES, {
    ...options,
  });
  const productCategories = data?.productCategories || [];

  return {
    productCategories,
    loading,
    error,
  };
};
