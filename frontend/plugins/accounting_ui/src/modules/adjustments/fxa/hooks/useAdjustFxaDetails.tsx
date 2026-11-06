import type {
  AccountingAdjustFxaDetailsQuery,
  AccountingAdjustFxaDetailsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery, useSubscription } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { ADJUST_FXA_DETAILS_QUERY } from '@/adjustments/fxa/graphql/adjustFixedAssetQueries';
import { ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED } from '@/adjustments/fxa/graphql/adjustFixedAssetSubscription';
import { ADJ_FXA_STATUSES } from '@/adjustments/fxa/types/AdjustFixedAsset';

export const useAdjustFxaDetails = (
  options?: QueryHookOptions<
    AccountingAdjustFxaDetailsQuery,
    AccountingAdjustFxaDetailsQueryVariables
  >,
) => {
  const { t } = useTranslation('accounting');
  const adjustId = options?.variables?._id;
  const variables = {
    _id: adjustId ?? '',
    ...options?.variables,
    page: 1,
    perPage: ACC_TRS__PER_PAGE,
  };
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
    client,
  } = useQuery(ADJUST_FXA_DETAILS_QUERY, {
    ...options,
    fetchPolicy: options?.fetchPolicy ?? 'cache-and-network',
    skip: !adjustId,
    variables,
  });
  const data = toGraphqlView(queryData);
  const refreshGeneration = useRef(0);
  const refreshPending = useRef(false);

  useSubscription(ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED, {
    variables: { adjustId: adjustId ?? '' },
    skip: !adjustId,
    onData: ({ data: event }) => {
      const changed = event.data?.accountingAdjustFixedAssetChanged;

      if (!changed || changed.status === ADJ_FXA_STATUSES.RUNNING) {
        return;
      }

      refreshGeneration.current += 1;
      refreshPending.current = true;
      const generation = refreshGeneration.current;

      client
        .query({
          query: ADJUST_FXA_DETAILS_QUERY,
          variables,
          fetchPolicy: 'no-cache',
          context: { queryDeduplication: false },
        })
        .then(({ data: refreshed }) => {
          if (generation === refreshGeneration.current) {
            client.writeQuery({
              query: ADJUST_FXA_DETAILS_QUERY,
              variables,
              data: refreshed,
            });
          }
        })
        .catch((refreshError: Error) => {
          toast({
            title: t('error'),
            description: refreshError.message,
            variant: 'destructive',
          });
        })
        .finally(() => {
          if (generation === refreshGeneration.current) {
            refreshPending.current = false;
          }
        });
    },
  });

  const adjustFxaDetails = data?.adjustFxaDetails || [];
  const adjustFxaDetailsCount = data?.adjustFxaDetailsCount || 0;

  const handleFetchMore = () => {
    if (
      refreshPending.current ||
      adjustFxaDetails.length >= adjustFxaDetailsCount
    ) {
      return;
    }

    const generation = refreshGeneration.current;

    fetchMore({
      variables: {
        perPage: ACC_TRS__PER_PAGE,
        page: Math.ceil(adjustFxaDetails.length / ACC_TRS__PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (generation !== refreshGeneration.current) {
          return prev;
        }

        return {
          ...prev,
          ...fetchMoreResult,
          adjustFxaDetails: [
            ...(prev.adjustFxaDetails ?? []),
            ...(fetchMoreResult.adjustFxaDetails ?? []),
          ],
        };
      },
    });
  };

  return {
    adjustFxaDetails,
    adjustFxaDetailsCount,
    loading,
    error,
    handleFetchMore,
  };
};
