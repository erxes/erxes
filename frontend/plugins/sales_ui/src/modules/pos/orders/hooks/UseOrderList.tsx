import queries from '@/pos/orders/graphql/queries';
import { useQuery } from '@apollo/client';
import { useMemo, useCallback } from 'react';
import { IOrder } from '@/pos/types/order';

const POS_PER_PAGE = 30;

interface UseOrdersListOptions {
  posId?: string;
  [key: string]: any;
}

interface UseOrdersListReturn {
  loading: boolean;
  ordersList: IOrder[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const useOrdersList = (
  options: UseOrdersListOptions = {},
): UseOrdersListReturn => {
  const { posId, ...otherOptions } = options;

  const variables = useMemo(
    () => ({
      perPage: POS_PER_PAGE,
      ...(posId && { posId }),
      ...otherOptions,
    }),
    [posId, otherOptions],
  );

  const { data, loading, fetchMore } = useQuery(queries.POS_ORDERS_QUERY, {
    variables,
  });

  const ordersList = useMemo<IOrder[]>(
    () => data?.posOrders || [],
    [data?.posOrders],
  );

  const totalCount = useMemo(
    () => data?.posOrdersTotalCount || 0,
    [data?.posOrdersTotalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.posOrders) return;

    fetchMore({
      variables: {
        page: Math.ceil(ordersList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.posOrders) {
          return prev;
        }
        return {
          ...prev,
          posOrders: [...(prev.posOrders || []), ...fetchMoreResult.posOrders],
          posOrdersTotalCount: fetchMoreResult.posOrdersTotalCount,
        };
      },
    });
  }, [ordersList.length, fetchMore, data?.posOrders]);

  return {
    loading,
    ordersList,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: ordersList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
