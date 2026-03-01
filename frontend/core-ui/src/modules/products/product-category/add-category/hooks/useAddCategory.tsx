import { productsQueries } from '@/products/graphql';
import { ApolloCache, MutationHookOptions, useMutation } from '@apollo/client';
import {
  AddCategoryResult,
  AddCategoryVariables,
  CategoryData,
} from '../../types/CategoryType';
import { categoryAdd } from '../graphql/mutations';

export function useAddCategory(
  options?: MutationHookOptions<AddCategoryResult, AddCategoryVariables>,
) {
  const [productCategoriesAdd, { loading, error }] = useMutation<
    AddCategoryResult,
    AddCategoryVariables
  >(categoryAdd, {
    ...options,
    update: (cache: ApolloCache<AddCategoryVariables>, { data }) => {
      try {
        const existingData = cache.readQuery<CategoryData>({
          query: productsQueries.productCategories,
        });

        if (
          !existingData ||
          !existingData.productCategories ||
          !data?.productCategoriesAdd
        )
          return;

        cache.writeQuery<CategoryData>({
          query: productsQueries.productCategories,
          data: {
            productCategories: [
              ...existingData.productCategories,
              data.productCategoriesAdd,
            ],
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  return { productCategoriesAdd, loading, error };
}
