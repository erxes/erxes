import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  DealsArchiveMutation,
  DealsArchiveMutationVariables,
} from '~/gql/graphql';

import { DEALS_ARCHIVE } from '@/deals/graphql/mutations/DealsMutations';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function useDealsArchive(
  options?: MutationHookOptions<
    DealsArchiveMutation,
    DealsArchiveMutationVariables
  >,
) {
  const { t } = useTranslation('sales');
  const [archiveDealsBase, { loading, error }] = useMutation(DEALS_ARCHIVE, {
    ...options,
    variables: options?.variables,
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
      refetchQueries: [
        'salesDealList',
        'salesDealSearchDropdown',
        'Deals', // Still used by the Mongolian plugin's synced-deals query.
      ],
    });

  return {
    archiveDeals,
    loading,
    error,
  };
}
