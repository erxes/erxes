import {
  ApolloError,
  MutationFunctionOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useCallback } from 'react';

import { productRemove } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { useCurrentDealId } from '@/deals/cards/hooks/useCurrentDealId';
import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { IProductData } from 'ui-modules';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { updateDealProductsCache } from './updateDealProductsCache';

interface RemoveProductsVariables {
  processId: string;
  dataIds: string[];
}

export const useRemoveProducts = () => {
  const [mutateRemoveProducts, { loading }] = useMutation(productRemove);
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const dealId = useCurrentDealId();
  const client = useApolloClient();

  // Callbacks run manually: passing onError to useMutation makes the mutate
  // promise resolve on failure, hiding errors from this wrapper.
  const removeProducts = useCallback(
    async (
      options: Omit<MutationFunctionOptions, 'variables'> & {
        variables: RemoveProductsVariables;
      },
    ) => {
      const { onCompleted, onError, ...executeOptions } = options;

      try {
        const result = await mutateRemoveProducts({
          ...executeOptions,
          variables: {
            ...executeOptions.variables,
            dealId,
          },
        });
        const remainingProductsData: IProductData[] | undefined =
          result.data?.dealsDeleteProductData?.productsData;

        if (remainingProductsData) {
          updateDealProductsCache(client, dealId, remainingProductsData);
        }

        toast({
          title: t('products-deleted'),
          variant: 'success',
          ...DEAL_TOAST_OPTIONS,
        });
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

        return undefined;
      }
    },
    [client, dealId, mutateRemoveProducts, t, toast],
  );

  return { removeProducts, loading };
};
