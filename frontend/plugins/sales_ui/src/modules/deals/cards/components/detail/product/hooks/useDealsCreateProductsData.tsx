'use client';

import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { DEALS_CREATE_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';

export const useDealsCreateProductsData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const [salesItemId] = useQueryState('salesItemId');
  const client = useApolloClient();

  const [createDealsProductData, { loading, error }] = useMutation(
    DEALS_CREATE_PRODUCT_DATA,
    {
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          variant: 'success',
        });
        options?.onCompleted?.(data);

        const newDocs = data.dealsCreateProductsData.productsData;

        client.cache.modify({
          id: client.cache.identify({
            _id: salesItemId as string,
            __typename: 'Deal',
          }),
          fields: {
            productsData() {
              return newDocs;
            },
            products(existingProducts = [], { readField }) {
              const cachedProducts = Array.isArray(existingProducts)
                ? existingProducts
                : [];
              const existingProductsById = new Map(
                cachedProducts.map((product: any) => [readField('_id', product), product]),
              );

              return (newDocs as any[])
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
      },
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
        options?.onError?.(e);
      },
    },
  );
  return {
    createDealsProductData,
    loading,
    error,
  };
};
