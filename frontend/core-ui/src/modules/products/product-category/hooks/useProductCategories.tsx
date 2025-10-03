import { OperationVariables, useQuery } from '@apollo/client';
import { productsQueries } from '@/products/graphql';

export const useProductCategories = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery(
    productsQueries.productCategories,
    options
  );

  const { productCategories } = data || {};

  return {
    productCategories,
    loading,
    error,
  };
};
