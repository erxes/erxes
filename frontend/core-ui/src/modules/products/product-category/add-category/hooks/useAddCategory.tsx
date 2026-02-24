import { productsQueries } from '@/products/graphql';
import { PRODUCTS_PER_PAGE } from '@/products/hooks/useProducts';
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
        const queryVariables = { perPage: PRODUCTS_PER_PAGE };

        const existingData = cache.readQuery<CategoryData>({
          query: productsQueries.productCategories,
          variables: queryVariables,
        });

        if (
          !existingData ||
          !existingData.productCategories ||
          !data?.productCategoriesAdd
        )
          return;

        cache.writeQuery<CategoryData>({
          query: productsQueries.productCategories,
          variables: queryVariables,
          data: {
            productCategories: {
              ...existingData.productCategories,
              list: [
                ...existingData.productCategories.list,
                data.productCategoriesAdd,
              ],
              totalCount: existingData.productCategories.totalCount + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  return { productCategoriesAdd, loading, error };
}
