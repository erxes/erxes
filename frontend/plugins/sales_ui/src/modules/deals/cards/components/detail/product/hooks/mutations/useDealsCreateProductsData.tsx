'use client';

import type { DealProductData } from '@/deals/utils/dealJson';
import { parseDealProductMutation } from '@/deals/utils/dealJson';
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
import type {
  DealsCreateProductsDataMutation,
  DealsCreateProductsDataMutationVariables,
} from '~/gql/graphql';

import { DEALS_CREATE_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { useCurrentDealId } from '@/deals/cards/hooks/useCurrentDealId';
import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';

import {
  serializeDealProductMutation,
  withDealIdVariables,
} from './serializeDealProductMutation';

interface CreateProductsDataVariables {
  processId: string;
  docs: DealProductData[];
}

export const useDealsCreateProductsData = (
  options?: MutationHookOptions<
    DealsCreateProductsDataMutation,
    DealsCreateProductsDataMutationVariables
  >,
) => {
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
      executeOptions: Omit<
        MutationFunctionOptions<
          DealsCreateProductsDataMutation,
          DealsCreateProductsDataMutationVariables
        >,
        'variables'
      > & {
        variables: CreateProductsDataVariables;
      },
    ) => {
      try {
        const result = await serializeDealProductMutation({
          client,
          dealId,
          mutation: () =>
            mutateCreateProductsData(
              withDealIdVariables(executeOptions, dealId),
            ),
          selectProductsData: (mutationResult) =>
            parseDealProductMutation(
              mutationResult.data?.dealsCreateProductsData,
            ),
        });

        toast({
          title: t('success'),
          variant: 'success',
          ...DEAL_TOAST_OPTIONS,
        });

        if (result.data) onCompleted?.(result.data);

        return result;
      } catch (e) {
        const apolloError =
          e instanceof ApolloError
            ? e
            : new ApolloError({
                errorMessage: e instanceof Error ? e.message : String(e),
              });

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
    [client, dealId, mutateCreateProductsData, onCompleted, onError, t, toast],
  );

  return {
    createDealsProductData,
    loading,
    error,
  };
};
