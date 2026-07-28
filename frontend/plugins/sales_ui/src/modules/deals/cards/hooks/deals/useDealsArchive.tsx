import { MutationHookOptions, useMutation } from '@apollo/client';

import { DEALS_ARCHIVE } from '@/deals/graphql/mutations/DealsMutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function useDealsArchive(options?: MutationHookOptions) {
  const { t } = useTranslation('sales');
  const [archiveDealsBase, { loading, error }] = useMutation(DEALS_ARCHIVE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: t('deals-archived'),
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

  const archiveDeals = (stageId: string) =>
    archiveDealsBase({
      variables: { stageId },
      // Board columns query Deals with stageId *and* pipelineId plus the
      // active filters, so refetching one exact { stageId } variable set
      // matched no live query and the board had nothing to fall back on when
      // a subscription event was missed. Refetch by operation name instead.
      refetchQueries: ['Deals'],
    });

  return {
    archiveDeals,
    loading,
    error,
  };
}
