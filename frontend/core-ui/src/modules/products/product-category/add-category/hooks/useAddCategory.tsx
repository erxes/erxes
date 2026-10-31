import { productsQueries } from '@/products/graphql';
import { MutationHookOptions, useMutation } from '@apollo/client';
import {
  AddCategoryResult,
  AddCategoryVariables,
} from '../../types/CategoryType';
import { categoryAdd } from '../graphql/mutations';

export function useAddCategory(
  options?: MutationHookOptions<AddCategoryResult, AddCategoryVariables>,
) {
  const [productCategoriesAdd, { loading, error }] = useMutation<
    AddCategoryResult,
    AddCategoryVariables
  >(categoryAdd, {
    refetchQueries: [
      productsQueries.productCategories,
      productsQueries.productCategoriesTotalCount,
    ],
    awaitRefetchQueries: true,
    ...options,
  });

  return { productCategoriesAdd, loading, error };
}
