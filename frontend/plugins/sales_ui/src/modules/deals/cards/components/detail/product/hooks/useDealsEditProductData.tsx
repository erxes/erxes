'use client';

import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { DEALS_EDIT_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { IProductData } from 'ui-modules';
import { updateDealProductsCache } from './updateDealProductsCache';

export const useDealsEditProductData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const [salesItemId] = useQueryState<string>('salesItemId');
  const client = useApolloClient();

  const [editDealsProductData, { loading, error }] = useMutation(
    DEALS_EDIT_PRODUCT_DATA,
    {
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          variant: 'success',
        });
        const nextProductsData: IProductData[] =
          data.dealsEditProductData.productsData;

        updateDealProductsCache(client, salesItemId, nextProductsData);

        options?.onCompleted?.(data);
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
    editDealsProductData,
    loading,
    error,
  };
};
