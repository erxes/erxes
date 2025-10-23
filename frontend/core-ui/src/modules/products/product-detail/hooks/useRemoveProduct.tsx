import { MutationHookOptions, useMutation } from '@apollo/client';
import { IProduct } from 'ui-modules';
import { productsRemoveMutation } from '../graphql/mutations/ProductRemoveMutations';
import { productsQueries } from '@/products/graphql';

const PRODUCTS_PAGE_SIZE = 30;

export const useRemoveProducts = () => {
  const [_removeProducts, { loading }] = useMutation(productsRemoveMutation.productRemove);

  const removeProducts = (
    productIds: string[],
    options?: MutationHookOptions,
  ) => {
    _removeProducts({
      ...options,
      variables: { productIds, ...options?.variables },
      update: (cache) => {
        try {
          cache.updateQuery(
            {
              query: productsQueries.productsMain,
              variables: { perPage: PRODUCTS_PAGE_SIZE, dateFilters: null },
            },
            ({ productsMain }) => ({
              productsMain: {
                ...productsMain,
                list: productsMain.list.filter(
                  (product: IProduct) => !productIds.includes(product._id),
                ),
                totalCount: Math.max(0, productsMain.totalCount - productIds.length),
              },
            }),
          );
        } catch (e) {
          console.error('Cache update failed:', e);
        }
      },
    });
  };

  return { removeProducts, loading };
};