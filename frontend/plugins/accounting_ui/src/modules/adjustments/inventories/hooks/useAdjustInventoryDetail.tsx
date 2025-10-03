import { OperationVariables, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_INVENTORY_DETAIL_QUERY } from '../graphql/adjustInventoryQueries';
import { IAdjustInventory } from '../types/AdjustInventory';
import { ACCOUNTING_ADJUST_INVENTORY_CHANGED } from '../graphql/adjustInventorySubscription';

export const useAdjustInventoryDetail = (options: OperationVariables) => {
  const { data, loading, error, subscribeToMore, client } = useQuery<
    { adjustInventoryDetail: IAdjustInventory },
    OperationVariables
  >(ADJUST_INVENTORY_DETAIL_QUERY, {
    ...options,
  });

  const adjustInventory = data?.adjustInventoryDetail;

  useEffect(() => {
    const unsubscribe = subscribeToMore<{
      accountingAdjustInventoryChanged: IAdjustInventory;
    }>({
      document: ACCOUNTING_ADJUST_INVENTORY_CHANGED,
      variables: {
        adjustId: options.variables?._id,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newAdjustInventoryDetail = subscriptionData.data.accountingAdjustInventoryChanged;

        try {
          // Get the cache ID for the conversation
          const newAdjustId = client.cache.identify({
            __typename: 'AdjustInventoryDetail',
            _id: options.variables?._id,
          });

          if (newAdjustId) {
            // Update the conversation in the cache
            client.cache.modify({
              id: newAdjustId,
              fields: {
                newAdjustInventoryDetail: () => newAdjustInventoryDetail,
              },
            });
          }
        } catch (error) {
          console.error('Error updating cache:', error);
        }

        return {
          adjustInventoryDetail: newAdjustInventoryDetail
        };
      },
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    adjustInventory,
    loading,
    error,
  };
};
