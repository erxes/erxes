import { productsMutations, productsQueries } from '@/products/graphql';
import { PRODUCTS_PER_PAGE } from '@/products/hooks/useProducts';
import { OperationVariables, useMutation } from '@apollo/client';
import { IProductCategory } from 'ui-modules';

export const useRemoveCategories = () => {
  const [_removeCategory, { loading }] = useMutation(
    productsMutations.categoryRemove,
  );

  const removeCategory = async (
    categoryIds: string | string[],
    options?: OperationVariables,
  ) => {
    await _removeCategory({
      ...options,
      variables: {
        _id: categoryIds,
        ...options?.variables,
      },
      update: (cache) => {
        try {
          cache.updateQuery(
            {
              query: productsQueries.productCategories,
              variables: { perPage: PRODUCTS_PER_PAGE, dateFilters: null },
            },
            ({ productCategoriesMain }) => ({
              productCategoriesMain: {
                ...productCategoriesMain,
                list: productCategoriesMain.list.filter(
                  (category: IProductCategory) => category._id !== categoryIds,
                ),
                totalCount: productCategoriesMain.totalCount - 1,
              },
            }),
          );
        } catch (e) {
          console.log(e);
        }
      },
    });
  };

  return { removeCategory, loading };
};
