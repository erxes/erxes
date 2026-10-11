import type {
  AccountingAdjustInventoryDetailQuery,
  AccountingAdjustInventoryDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_INVENTORY_DETAIL_QUERY } from '../graphql/adjustInventoryQueries';

import { ACCOUNTING_ADJUST_INVENTORY_CHANGED } from '../graphql/adjustInventorySubscription';

export const useAdjustInventoryDetail = (
  options: QueryHookOptions<
    AccountingAdjustInventoryDetailQuery,
    AccountingAdjustInventoryDetailQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
    subscribeToMore,
    client,
  } = useQuery(ADJUST_INVENTORY_DETAIL_QUERY, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  const adjustInventory = data?.adjustInventoryDetail;

  useEffect(() => {
    const adjustId = options.variables?._id;
    if (!adjustId) return;
    const unsubscribe = subscribeToMore({
      document: ACCOUNTING_ADJUST_INVENTORY_CHANGED,
      variables: {
        adjustId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newAdjustInventoryDetail =
          subscriptionData.data.accountingAdjustInventoryChanged;

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
          adjustInventoryDetail: newAdjustInventoryDetail,
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
