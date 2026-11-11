import type {
  AccountingAdjustInventoryDetailQuery,
  AccountingAdjustInventoryDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { ADJUST_INVENTORY_DETAIL_QUERY } from '@/adjustments/inventories/graphql/adjustInventoryQueries';
import { ACCOUNTING_ADJUST_INVENTORY_CHANGED } from '@/adjustments/inventories/graphql/adjustInventorySubscription';

export const useAdjustInventoryDetail = (
  options: QueryHookOptions<
    AccountingAdjustInventoryDetailQuery,
    AccountingAdjustInventoryDetailQueryVariables
  >,
) => {
  const adjustId = options.variables?._id;
  const {
    data: queryData,
    loading,
    error,
    subscribeToMore,
  } = useQuery(ADJUST_INVENTORY_DETAIL_QUERY, {
    ...options,
    fetchPolicy: 'cache-and-network',
  });
  const data = toGraphqlView(queryData);

  useEffect(() => {
    if (!adjustId) {
      return undefined;
    }

    return subscribeToMore({
      document: ACCOUNTING_ADJUST_INVENTORY_CHANGED,
      variables: { adjustId },
      updateQuery: (prev, { subscriptionData }) => {
        const changed = subscriptionData.data?.accountingAdjustInventoryChanged;

        if (!prev || !changed) {
          return prev;
        }

        return { adjustInventoryDetail: changed };
      },
    });
  }, [adjustId, subscribeToMore]);

  return {
    adjustInventory: data?.adjustInventoryDetail,
    loading,
    error,
  };
};
