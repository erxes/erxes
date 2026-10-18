import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  DealsWatchMutation,
  DealsWatchMutationVariables,
} from '~/gql/graphql';

import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { DEALS_WATCH } from '@/deals/graphql/mutations/DealsMutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function useDealsWatch(
  options?: MutationHookOptions<
    DealsWatchMutation,
    DealsWatchMutationVariables
  >,
) {
  const { t } = useTranslation('sales');

  const [watchDeals, { loading, error }] = useMutation(DEALS_WATCH, {
    ...options,
    variables: options?.variables,
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('watch-status-updated'),
        variant: 'default',
        ...DEAL_TOAST_OPTIONS,
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: t('error'),
        description: err.message || t('update-failed'),
        variant: 'destructive',
        ...DEAL_TOAST_OPTIONS,
      });
      options?.onError?.(err);
    },
  });

  return {
    watchDeals,
    loading,
    error,
  };
}
