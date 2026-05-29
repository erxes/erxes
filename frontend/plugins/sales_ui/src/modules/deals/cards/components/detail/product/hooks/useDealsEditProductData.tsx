'use client';

import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useQueryState, useToast } from 'erxes-ui';

import { DEALS_EDIT_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';

export const useDealsEditProductData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [salesItemId] = useQueryState('salesItemId');
  const client = useApolloClient();

  const [editDealsProductData, { loading, error }] = useMutation(
    DEALS_EDIT_PRODUCT_DATA,
    {
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          variant: 'success',
        });
        const nextProductsData = data.dealsEditProductData.productsData;

        // Update Apollo cache manually
        client.cache.modify({
          id: client.cache.identify({
            _id: salesItemId as string,
            __typename: 'Deal',
          }),
          fields: {
            productsData() {
              return nextProductsData;
            },
            products(existingProducts = [], { readField }) {
              const cachedProducts = Array.isArray(existingProducts)
                ? existingProducts
                : [];
              const existingProductsById = new Map(
                cachedProducts.map((product: any) => [readField('_id', product), product]),
              );

              return (nextProductsData as any[])
                .filter((pd) => pd.productId)
                .map((pd) => {
                  if (pd.product?._id) {
                    return { __typename: 'Product', ...pd.product };
                  }

                  return (
                    existingProductsById.get(pd.productId) || {
                      __typename: 'Product',
                      _id: pd.productId,
                    }
                  );
                });
            },
          },
        });

        options?.onCompleted?.(data);
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
    },
  );
  return {
    editDealsProductData,
    loading,
    error,
  };
};
