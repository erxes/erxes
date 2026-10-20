import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  DealsAddMutation,
  DealsAddMutationVariables,
} from '~/gql/graphql';

import { ADD_DEALS } from '@/deals/graphql/mutations/DealsMutations';
import { dealCreateDefaultValuesState } from '@/deals/states/dealCreateSheetState';
import { toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export function useDealsAdd(
  options?: MutationHookOptions<DealsAddMutation, DealsAddMutationVariables>,
) {
  const { t } = useTranslation('sales');
  const [defaultValues] = useAtom(dealCreateDefaultValuesState);

  const [addDeals, { loading, error }] = useMutation(ADD_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      aboveItemId: '',
      stageId: defaultValues?.stageId,
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
