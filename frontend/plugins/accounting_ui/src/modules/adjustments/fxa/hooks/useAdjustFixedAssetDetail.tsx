import { OperationVariables, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_FIXED_ASSET_DETAIL_QUERY } from '../graphql/adjustFixedAssetQueries';
import { ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED } from '../graphql/adjustFixedAssetSubscription';
import { IAdjustFixedAsset } from '../types/AdjustFixedAsset';

export const useAdjustFixedAssetDetail = (options?: OperationVariables) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    {
      adjustFixedAssetDetail?: IAdjustFixedAsset;
    },
    OperationVariables
  >(ADJUST_FIXED_ASSET_DETAIL_QUERY, options);

  useEffect(() => {
    const adjustId = options?.variables?._id;

    if (!adjustId) {
      return;
    }

    const unsubscribe = subscribeToMore<{
      accountingAdjustFixedAssetChanged: IAdjustFixedAsset;
    }>({
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
