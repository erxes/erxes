'use client';

import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useQueryState, useToast } from 'erxes-ui';

import { DEALS_CREATE_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/DealsCreateProductData';

export const useDealsCreateProductsData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const [salesItemId] = useQueryState('salesItemId');
  const client = useApolloClient();

  const [createDealsProductData, { loading, error }] = useMutation(
    DEALS_CREATE_PRODUCT_DATA,
    {
      onCompleted: (data) => {
        toast({
          title: 'Success',
          variant: 'success',
        });
        options?.onCompleted?.(data);

        const newDocs = data.dealsCreateProductsData.productsData;

        // Update Apollo cache manually
        client.cache.modify({
          id: client.cache.identify({
            _id: salesItemId as string,
            __typename: 'Deal',
          }),
          fields: {
            products(existingProducts = []) {
              return [...existingProducts, ...newDocs];
            },
          },
        });
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
      ...options,
    },
  );
  return {
    createDealsProductData,
    loading,
    error,
  };
};
