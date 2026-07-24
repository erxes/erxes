import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';

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
  options?: MutationHookOptions,
  config?: UseDealsEditConfig,
) {
  const { toastOptions } = config || {};
  const { t } = useTranslation('sales');
  const [_id] = useAtom(dealDetailSheetState);
  const [salesItemId] = useQueryState('salesItemId');

  const [editDeals, { loading, error }] = useMutation(EDIT_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
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
        ...toastOptions,
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('update-failed'),
        variant: 'destructive',
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
