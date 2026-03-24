import { QueryHookOptions, useQuery } from '@apollo/client';
import { IProductCategory } from 'ui-modules';
import { productsQueries } from '../graphql/ProductsQueries';

export const useProductCategories = (options?: QueryHookOptions) => {
  const { data, loading } = useQuery<{
    productCategories: IProductCategory[];
  }>(productsQueries.productCategories, options);

  return {
    productCategories: data?.productCategories,
    loading,
  };
};
