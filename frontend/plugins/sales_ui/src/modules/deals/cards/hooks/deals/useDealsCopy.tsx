import { MutationHookOptions, useMutation } from '@apollo/client';

import { DEALS_COPY } from '@/deals/graphql/mutations/DealsMutations';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export function useDealsCopy(options?: MutationHookOptions<any, any>) {
  const { t } = useTranslation('sales');
  const [_id] = useAtom(dealDetailSheetState);

  const [copyDeals, { loading, error }] = useMutation(DEALS_COPY, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('deal-copied'),
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
    },
  });

  return {
    copyDeals,
    loading,
    error,
  };
}
