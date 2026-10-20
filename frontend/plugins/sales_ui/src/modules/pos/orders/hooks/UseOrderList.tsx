import { IOrder } from '@/pos/types/order';
import { hasId } from '@/pos/utils/posJson';
import {
  readPosCount,
  toPosOrderRow,
  readPosData,
} from '@/pos/utils/posOrderJson';
import { useQuery } from '@apollo/client';
import {
  parseDateRangeFromString,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import type { PosOrdersQueryVariables } from '~/gql/graphql';
import { POS_ORDERS_QUERY } from '~/modules/pos/orders/graphql/queries/queries';
import { posOrderTotalCountAtom } from '../states/usePosOrderCounts';

const POS_PER_PAGE = 30;

type UseOrdersListOptions = PosOrdersQueryVariables;

interface UseOrdersListReturn {
  loading: boolean;
  error?: Error;
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
    posId: posId !== undefined ? posId : pos || undefined,
    search: (() => {
      const searchParts = [];
      if (searchValue) searchParts.push(searchValue);
      if (number) searchParts.push(number);
      return searchParts.length > 0 ? searchParts.join(' ') : undefined;
    })(),
    customerId: customer || company || undefined,
    userId: user || undefined,
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
  const { data, loading, error, fetchMore } = useQuery(POS_ORDERS_QUERY, {
    variables,
  });

  const parsed = useMemo(
    () =>
      readPosData(() =>
        (data?.posOrders ?? []).filter(hasId).map(toPosOrderRow),
      ),
    [data?.posOrders],
  );
  const ordersList = parsed.value ?? [];
  const totalCount = useMemo(
    () => readPosCount(data?.posOrdersTotalCount),
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
        };
      },
    });
  }, [ordersList.length, fetchMore, data?.posOrders]);

  useEffect(() => {
    setOrdersTotalCount(totalCount ?? null);
  }, [totalCount, setOrdersTotalCount]);

  return {
    loading,
    error: error ?? parsed.error,
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
