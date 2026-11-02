import { POS_ORDER_DETAIL_QUERY } from '@/pos/orders/detail/graphql/queries/posOrderDetailQuery';
import {
  getPosItemRowIdSplits,
  readPosData,
  toPosOrderDetail,
} from '@/pos/utils/posOrderJson';
import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

export const useResolvePosItemOrderId = () => {
  const client = useApolloClient();

  return useCallback(
    async (rowId: string) => {
      for (const { orderId, itemId } of getPosItemRowIdSplits(rowId)) {
        const result = await client
          .query({ query: POS_ORDER_DETAIL_QUERY, variables: { id: orderId } })
          .catch(() => null);
        const order = result?.data?.posOrderDetail;
        const items = order
          ? readPosData(() => toPosOrderDetail(order).items).value
          : undefined;

        if (items?.some((item) => item._id === itemId)) {
          return orderId;
        }
      }

      return rowId;
    },
    [client],
  );
};
