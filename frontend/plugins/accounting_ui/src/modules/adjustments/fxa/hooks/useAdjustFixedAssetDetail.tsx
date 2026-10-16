import type {
  AccountingAdjustFixedAssetDetailQuery,
  AccountingAdjustFixedAssetDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_FIXED_ASSET_DETAIL_QUERY } from '../graphql/adjustFixedAssetQueries';
import { ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED } from '../graphql/adjustFixedAssetSubscription';

export const useAdjustFixedAssetDetail = (
  options?: QueryHookOptions<
    AccountingAdjustFixedAssetDetailQuery,
    AccountingAdjustFixedAssetDetailQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    subscribeToMore,
  } = useQuery(ADJUST_FIXED_ASSET_DETAIL_QUERY, options);
  const data = toGraphqlView(queryData);

  useEffect(() => {
    const adjustId = options?.variables?._id;

    if (!adjustId) {
      return;
    }

    const unsubscribe = subscribeToMore({
      document: ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED,
      variables: { adjustId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) {
          return prev;
        }

        return {
          adjustFixedAssetDetail:
            subscriptionData.data.accountingAdjustFixedAssetChanged,
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options?.variables?._id, subscribeToMore]);

  return {
    adjustFixedAsset: data?.adjustFixedAssetDetail,
    loading,
    error,
  };
};
