import { OperationVariables, useQuery } from '@apollo/client';
import { pmsQueries } from '@/pms/graphql/queries';
import {
  ProductCategoriesResponse,
  UseProductCategoriesResult,
} from '@/pms/types/types';

export const useProductCategories = (
  options?: OperationVariables,
): UseProductCategoriesResult => {
  const { data, loading, error } = useQuery<ProductCategoriesResponse>(
    pmsQueries.ProductCategories,
    options,
  );

  return {
    productCategories: data?.productCategories,
    loading,
    error,
  };
};
