import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import type {
  DealsEditMutation,
  DealsEditMutationVariables,
} from '~/gql/graphql';

import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { EDIT_DEALS } from '@/deals/graphql/mutations/DealsMutations';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

interface UseDealsEditConfig {
  toastOptions?: {
    className?: string;
    dismissOnPointerEnter?: boolean;
  };
}

export function useDealsEdit(
  options?: MutationHookOptions<DealsEditMutation, DealsEditMutationVariables>,
  config?: UseDealsEditConfig,
) {
  const { toastOptions } = config || {};
  const { t } = useTranslation('sales');
  const [_id] = useAtom(dealDetailSheetState);
  const [salesItemId] = useQueryState<string>('salesItemId');

  const [editDeals, { loading, error }] = useMutation(EDIT_DEALS, {
    ...options,
    variables: _id ? { ...options?.variables, _id } : options?.variables,
    refetchQueries:
      salesItemId || _id
        ? [
            {
              query: GET_DEAL_DETAIL,
              variables: { ...options?.variables, _id: salesItemId || _id },
            },
          ]
        : [],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('deal-updated'),
        variant: 'success',
        ...DEAL_TOAST_OPTIONS,
        ...toastOptions,
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('update-failed'),
        variant: 'destructive',
        ...DEAL_TOAST_OPTIONS,
        ...toastOptions,
      });
    },
  });

  return {
    editDeals,
    loading,
    error,
  };
}
