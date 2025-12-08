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
      onCompleted: (data) => {
        toast({
          title: 'Success',
          variant: 'success',
        });
        options?.onCompleted?.(data);
        console.log('ddd', data);
        const newDocs = data.dealsEditProductData.productData;

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
    editDealsProductData,
    loading,
    error,
  };
};
