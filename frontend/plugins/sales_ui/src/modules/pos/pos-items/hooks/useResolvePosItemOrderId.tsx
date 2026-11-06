import { POS_ORDER_DETAIL_QUERY } from '@/pos/orders/detail/graphql/queries/posOrderDetailQuery';
import {
  getPosItemRowIdSplits,
  readPosData,
  toPosOrderDetail,
} from '@/pos/utils/posOrderJson';
import { ApolloError, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

const isOrderLookupRejected = (error: unknown) =>
  error instanceof ApolloError && error.graphQLErrors.length > 0;

export const useResolvePosItemOrderId = () => {
  const client = useApolloClient();

  return useCallback(
    async (rowId: string) => {
      let unresolved = false;

      for (const { orderId, itemId } of getPosItemRowIdSplits(rowId)) {
        let order;

        try {
          const result = await client.query({
            query: POS_ORDER_DETAIL_QUERY,
            variables: { id: orderId },
          });
          order = result.data?.posOrderDetail;
        } catch (error) {
          unresolved ||= !isOrderLookupRejected(error);
          continue;
        }

        if (!order) {
          continue;
        }

        const { value: items, error } = readPosData(
          () => toPosOrderDetail(order).items,
        );

        if (error) {
          unresolved = true;
          continue;
        }

        if (items?.some((item) => item._id === itemId)) {
          return orderId;
        }
      }

      if (unresolved) {
        throw new Error(`Could not resolve the POS order of item ${rowId}`);
      }

      return rowId;
    },
    [client],
  );
};
