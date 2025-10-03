import { QueryHookOptions, useQuery } from '@apollo/client';

import { productsQueries } from '@/products/graphql';
import { IProductCategory } from 'ui-modules';

export const useProductCategories = (options?: QueryHookOptions) => {
  const { data, loading } = useQuery<{
    productCategories: IProductCategory[];
  }>(productsQueries.productCategories, options);

  return {
    productCategories: data?.productCategories,
    loading,
  };
};
