import { QueryHookOptions, useQuery } from '@apollo/client';
import { PRODUCT_RULES } from '@/products/settings/graphql/queries/getProductRules';
import { IProductRule } from '../components/productsConfig/productRule/types';

export const useProductRules = (
  options?: QueryHookOptions<{ productRules: IProductRule[] }>,
) => {
  const { data, loading } = useQuery<{
    productRules: IProductRule[];
  }>(PRODUCT_RULES, options);

  return { productRules: data?.productRules, loading };
};
