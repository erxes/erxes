import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  DealsAddMutation,
  DealsAddMutationVariables,
} from '~/gql/graphql';

import { ADD_DEALS } from '@/deals/graphql/mutations/DealsMutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function useDealsAdd(
  options?: MutationHookOptions<DealsAddMutation, DealsAddMutationVariables>,
) {
  const { t } = useTranslation('sales');

  const [addDeals, { loading, error }] = useMutation(ADD_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      aboveItemId: '',
    },
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('deal-added'),
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
    addDeals,
    loading,
    error,
  };
}
