import { QueryHookOptions, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { PRODUCT_RULES } from '@/products/settings/graphql/queries/getProductRules';
import { IProductRule } from '../components/productsConfig/productRule/types';

export const useProductRules = (
  options?: QueryHookOptions<{ productRules: IProductRule[] }>,
) => {
  const [searchValue] = useQueryState<string>('searchValue');
  const [categoryIds] = useQueryState<string[]>('categoryIds');
  const [productIds] = useQueryState<string[]>('productIds');

  const { data, loading } = useQuery<{
    productRules: IProductRule[];
  }>(PRODUCT_RULES, {
    ...options,
    variables: {
      searchValue: searchValue || undefined,
      categoryIds: categoryIds?.length ? categoryIds : undefined,
      productIds: productIds?.length ? productIds : undefined,
      ...options?.variables,
    },
  });

  return { productRules: data?.productRules, loading };
};
