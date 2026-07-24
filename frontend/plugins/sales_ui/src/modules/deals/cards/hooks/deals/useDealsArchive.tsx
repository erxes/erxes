import { MutationHookOptions, useMutation } from '@apollo/client';

import { DEALS_ARCHIVE } from '@/deals/graphql/mutations/DealsMutations';
import { GET_DEALS } from '@/deals/graphql/queries/DealsQueries';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function useDealsArchive(options?: MutationHookOptions<any, any>) {
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
    },
  });

  const archiveDeals = (stageId: string) =>
    archiveDealsBase({
      variables: { stageId },
      refetchQueries: [{ query: GET_DEALS, variables: { stageId } }],
    });

  return {
    archiveDeals,
    loading,
    error,
  };
}
