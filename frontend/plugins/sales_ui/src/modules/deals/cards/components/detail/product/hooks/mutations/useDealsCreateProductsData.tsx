'use client';

import {
  ApolloError,
  MutationFunctionOptions,
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEALS_CREATE_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { useCurrentDealId } from '@/deals/cards/hooks/useCurrentDealId';
import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { IProductData } from 'ui-modules';
import { updateDealProductsCache } from './updateDealProductsCache';

interface CreateProductsDataVariables {
  processId: string;
  docs: IProductData[];
}

export const useDealsCreateProductsData = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const dealId = useCurrentDealId();
  const client = useApolloClient();

  const { onCompleted, onError, ...hookOptions } = options || {};
  const [mutateCreateProductsData, { loading, error }] = useMutation(
    DEALS_CREATE_PRODUCT_DATA,
    hookOptions,
  );

  // Callbacks run manually: passing onError to useMutation makes the mutate
  // promise resolve on failure, which breaks callers' rollback .catch chains.
  const createDealsProductData = useCallback(
    async (
      executeOptions: Omit<MutationFunctionOptions, 'variables'> & {
        variables: CreateProductsDataVariables;
      },
    ) => {
      try {
        const result = await mutateCreateProductsData({
          ...executeOptions,
          variables: {
            ...executeOptions.variables,
            dealId,
          },
        });

        toast({
          title: t('success'),
          variant: 'success',
          ...DEAL_TOAST_OPTIONS,
        });

        const newDocs: IProductData[] | undefined =
          result.data?.dealsCreateProductsData?.productsData;

        if (newDocs) {
          updateDealProductsCache(client, dealId, newDocs);
        }

        onCompleted?.(result.data);

        return result;
      } catch (e) {
        const apolloError = e as ApolloError;

        toast({
          title: t('error'),
          description: apolloError.message,
          variant: 'destructive',
          ...DEAL_TOAST_OPTIONS,
        });
        onError?.(apolloError);

        throw apolloError;
      }
    },
    [
      client,
      dealId,
      mutateCreateProductsData,
      onCompleted,
      onError,
      t,
      toast,
    ],
  );

  return {
    createDealsProductData,
    loading,
    error,
  };
};
