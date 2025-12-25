import { OperationVariables, useQuery } from '@apollo/client';
import { productCategories } from '@/pricing/graphql/queries';
import {
  ProductCategoriesResponse,
  UseProductCategoriesResult,
} from '@/pricing/types';

export const useProductCategories = (
  options?: OperationVariables,
): UseProductCategoriesResult => {
  const { data, loading, error } = useQuery<ProductCategoriesResponse>(
    productCategories,
    options,
  );

  return {
    productCategories: data?.productCategories,
    loading,
    error,
  };
};
