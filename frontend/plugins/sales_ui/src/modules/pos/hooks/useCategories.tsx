import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import { queries } from '@/pos/graphql';
import {
  ProductCategoriesResponse,
  UseProductCategoriesResult,
} from '@/pos/types/types';

export const useProductCategories = (
  options?: QueryHookOptions<ProductCategoriesResponse, OperationVariables>,
): UseProductCategoriesResult => {
  const { data, loading, error } = useQuery<
    ProductCategoriesResponse,
    OperationVariables
  >(queries.ProductCategories, options);

  return {
    productCategories: data?.productCategories,
    loading,
    error,
  };
};
