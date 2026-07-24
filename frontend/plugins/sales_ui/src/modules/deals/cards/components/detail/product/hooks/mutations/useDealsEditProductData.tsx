'use client';

import {
  ApolloError,
  MutationFunctionOptions,
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useQueryState, useToast } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEALS_EDIT_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { DEAL_PRODUCT_TOAST_OPTIONS } from '@/deals/cards/components/detail/product/constants';
import { IProductData } from 'ui-modules';
import { updateDealProductsCache } from './updateDealProductsCache';

interface EditProductDataVariables {
  processId: string;
  dataId: string;
  doc: IProductData;
}

export const useDealsEditProductData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const [salesItemId] = useQueryState<string>('salesItemId');
  const client = useApolloClient();

  const { onCompleted, onError, ...hookOptions } = options || {};
  const [mutateEditProductData, { loading, error }] = useMutation(
    DEALS_EDIT_PRODUCT_DATA,
    hookOptions,
  );

  // Callbacks run manually: passing onError to useMutation makes the mutate
  // promise resolve on failure, which breaks callers' rollback .catch chains.
  const editDealsProductData = useCallback(
    async (
      executeOptions: Omit<MutationFunctionOptions, 'variables'> & {
        variables: EditProductDataVariables;
      },
    ) => {
      try {
        // dealId always comes from the URL, not the caller: it must match
        // the id updateDealProductsCache writes into below.
        const result = await mutateEditProductData({
          ...executeOptions,
          variables: {
            ...executeOptions.variables,
            dealId: salesItemId || '',
          },
        });

        toast({
          title: t('success'),
          variant: 'success',
          ...DEAL_PRODUCT_TOAST_OPTIONS,
        });

        const nextProductsData: IProductData[] | undefined =
          result.data?.dealsEditProductData?.productsData;

        if (nextProductsData) {
          updateDealProductsCache(client, salesItemId, nextProductsData);
        }

        onCompleted?.(result.data);

        return result;
      } catch (e) {
        const apolloError = e as ApolloError;

        toast({
          title: t('error'),
          description: apolloError.message,
          variant: 'destructive',
          ...DEAL_PRODUCT_TOAST_OPTIONS,
        });
        onError?.(apolloError);

        throw apolloError;
      }
    },
    [
      client,
      mutateEditProductData,
      onCompleted,
      onError,
      salesItemId,
      t,
      toast,
    ],
  );

  return {
    editDealsProductData,
    loading,
    error,
  };
};
