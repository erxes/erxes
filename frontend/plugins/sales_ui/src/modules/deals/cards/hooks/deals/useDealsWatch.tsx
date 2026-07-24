import { MutationHookOptions, useMutation } from '@apollo/client';

import { DEALS_WATCH } from '@/deals/graphql/mutations/DealsMutations';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export function useDealsWatch(options?: MutationHookOptions<any, any>) {
  const { t } = useTranslation('sales');
  const [_id] = useAtom(dealDetailSheetState);

  const [watchDeals, { loading, error }] = useMutation(DEALS_WATCH, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('watch-status-updated'),
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
    watchDeals,
    loading,
    error,
  };
}
