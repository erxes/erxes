import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  DealsRemoveMutation,
  DealsRemoveMutationVariables,
} from '~/gql/graphql';

import { REMOVE_DEALS } from '@/deals/graphql/mutations/DealsMutations';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export function useDealsRemove(
  options?: MutationHookOptions<
    DealsRemoveMutation,
    DealsRemoveMutationVariables
  >,
) {
  const { t } = useTranslation('sales');
  const [_id] = useAtom(dealDetailSheetState);

  const [removeDeals, { loading, error }] = useMutation(REMOVE_DEALS, {
    ...options,
    variables: _id ? { ...options?.variables, _id } : options?.variables,
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('deal-removed'),
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('update-failed'),
        variant: 'destructive',
      });
      options?.onError?.(err);
    },
  });

  return {
    removeDeals,
    loading,
    error,
  };
}
