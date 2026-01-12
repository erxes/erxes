import queries from '~/modules/pos/orders/graphql/queries/queries';
import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import { IOrder } from '@/pos/types/order';
import {
  useMultiQueryState,
  parseDateRangeFromString,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { posOrderTotalCountAtom } from '../states/usePosOrderCounts';

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

export const useOrdersVariables = (options: UseOrdersListOptions = {}) => {
  const { posId, ...otherOptions } = options;

  const [
    {
      searchValue,
      customer,
      company,
      user,
      pos,
      types,
      status,
      excludeStatus,
      paidDateRange,
      createdDateRange,
    },
  ] = useMultiQueryState<{
    searchValue: string;
    customer: string;
    company: string;
    user: string;
    pos: string;
    types: string;
    status: string;
    excludeStatus: string;
    paidDateRange: string;
    createdDateRange: string;
  }>([
    'searchValue',
    'customer',
    'company',
    'user',
    'pos',
    'types',
    'status',
    'excludeStatus',
    'paidDateRange',
    'createdDateRange',
  ]);
  const [number] = useQueryState<string>('number');
  return {
    perPage: POS_PER_PAGE,
    ...(posId && { posId }),
    search: (() => {
      const searchParts = [];
      if (searchValue) searchParts.push(searchValue);
      if (number) searchParts.push(number);
      return searchParts.length > 0 ? searchParts.join(' ') : undefined;
    })(),
    customerId: customer || company || undefined,
    userId: user || undefined,
    posId: pos || undefined,
    types: types && types !== 'all' ? [types] : undefined,
    statuses: status && status !== 'all' ? [status] : undefined,
    excludeStatuses:
      excludeStatus && excludeStatus !== 'all' ? [excludeStatus] : undefined,
    paidStartDate: parseDateRangeFromString(paidDateRange)?.from,
    paidEndDate: parseDateRangeFromString(paidDateRange)?.to,
    createdStartDate: parseDateRangeFromString(createdDateRange)?.from,
    createdEndDate: parseDateRangeFromString(createdDateRange)?.to,
    ...otherOptions,
  };
};

export const useOrdersList = (
  options: UseOrdersListOptions = {},
): UseOrdersListReturn => {
  const variables = useOrdersVariables(options);
  const setOrdersTotalCount = useSetAtom(posOrderTotalCountAtom);
  const { data, loading, fetchMore } = useQuery(queries.POS_ORDERS_QUERY, {
    variables,
  });

  const ordersList = useMemo<IOrder[]>(
    () => data?.posOrders || [],
    [data?.posOrders],
  );

  const totalCount = useMemo(
    () => data?.posOrders?.length || 0,
    [data?.posOrders],
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
        };
      },
    });
  }, [ordersList.length, fetchMore, data?.posOrders]);

  useEffect(() => {
    if (!totalCount) return;
    setOrdersTotalCount(totalCount);
  }, [totalCount, setOrdersTotalCount]);

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
