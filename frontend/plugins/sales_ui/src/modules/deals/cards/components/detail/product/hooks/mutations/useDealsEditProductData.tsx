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
  DealsEditProductDataMutation,
  DealsEditProductDataMutationVariables,
} from '~/gql/graphql';

import { DEALS_EDIT_PRODUCT_DATA } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { useCurrentDealId } from '@/deals/cards/hooks/useCurrentDealId';
import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';

import {
  serializeDealProductMutation,
  withDealIdVariables,
} from './serializeDealProductMutation';

interface EditProductDataVariables {
  processId: string;
  dataId: DealsEditProductDataMutationVariables['dataId'];
  doc: DealProductData;
}

export const useDealsEditProductData = (
  options?: MutationHookOptions<
    DealsEditProductDataMutation,
    DealsEditProductDataMutationVariables
  >,
) => {
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const dealId = useCurrentDealId();
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
      executeOptions: Omit<
        MutationFunctionOptions<
          DealsEditProductDataMutation,
          DealsEditProductDataMutationVariables
        >,
        'variables'
      > & {
        variables: EditProductDataVariables;
      },
    ) => {
      try {
        const result = await serializeDealProductMutation({
          client,
          dealId,
          mutation: () =>
            mutateEditProductData(withDealIdVariables(executeOptions, dealId)),
          selectProductsData: (mutationResult) =>
            parseDealProductMutation(mutationResult.data?.dealsEditProductData),
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
    [client, dealId, mutateEditProductData, onCompleted, onError, t, toast],
  );

  return {
    editDealsProductData,
    loading,
    error,
  };
};
