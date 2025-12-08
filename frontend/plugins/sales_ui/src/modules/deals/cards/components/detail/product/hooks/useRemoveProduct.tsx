import { ApolloError, MutationHookOptions, useMutation } from '@apollo/client';

import { IProduct } from 'ui-modules';
import { productRemove } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { productsMain } from '@/deals/cards/components/detail/product/graphql/queries/ProductQueries';
import { useToast } from 'erxes-ui';

const PRODUCTS_PAGE_SIZE = 30;

export const useRemoveProducts = () => {
  const [_removeProducts, { loading }] = useMutation(productRemove);
  const { toast } = useToast();

  const removeProducts = (options?: MutationHookOptions) => {
    _removeProducts({
      ...options,
      variables: { ...options?.variables },
      onCompleted: (data) => {
        toast({
          title: 'Products deleted successfully',
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
      update: (cache) => {
        const { dataIds } = options?.variables || {};

        try {
          cache.updateQuery(
            {
              query: productsMain,
              variables: { perPage: PRODUCTS_PAGE_SIZE, dateFilters: null },
            },
            ({ productsMain }) => ({
              productsMain: {
                ...productsMain,
                list: productsMain.list.filter(
                  (product: IProduct) => !dataIds.includes(product._id),
                ),
                totalCount: Math.max(
                  0,
                  productsMain.totalCount - dataIds.length,
                ),
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
