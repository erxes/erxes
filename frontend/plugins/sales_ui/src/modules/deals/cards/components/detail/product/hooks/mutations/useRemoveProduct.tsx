import {
  ApolloError,
  MutationFunctionOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { useCallback } from 'react';

import { productRemove } from '@/deals/cards/components/detail/product/graphql/mutations/ProductsActions';
import { DEAL_PRODUCT_TOAST_OPTIONS } from '@/deals/cards/components/detail/product/constants';
import { IProductData } from 'ui-modules';
import { useQueryState, useToast } from 'erxes-ui';
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
  const [salesItemId] = useQueryState<string>('salesItemId');
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
        // dealId always comes from the URL, not the caller: it must match
        // the id updateDealProductsCache writes into below.
        const result = await mutateRemoveProducts({
          ...executeOptions,
          variables: {
            ...executeOptions.variables,
            dealId: salesItemId || '',
          },
        });
        const remainingProductsData: IProductData[] | undefined =
          result.data?.dealsDeleteProductData?.productsData;

        if (remainingProductsData) {
          updateDealProductsCache(client, salesItemId, remainingProductsData);
        }

        toast({
          title: t('products-deleted'),
          variant: 'success',
          ...DEAL_PRODUCT_TOAST_OPTIONS,
        });
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

        return undefined;
      }
    },
    [client, mutateRemoveProducts, salesItemId, t, toast],
  );

  return { removeProducts, loading };
};
