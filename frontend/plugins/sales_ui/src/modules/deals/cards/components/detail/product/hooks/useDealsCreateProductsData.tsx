'use client';

import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { DEALS_CREATE_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { IProductData } from 'ui-modules';
import { updateDealProductsCache } from './updateDealProductsCache';

export const useDealsCreateProductsData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const [salesItemId] = useQueryState<string>('salesItemId');
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

        const newDocs: IProductData[] =
          data.dealsCreateProductsData.productsData;

        updateDealProductsCache(client, salesItemId, newDocs);
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
