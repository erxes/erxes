import { useQuery } from '@apollo/client';
import queries from '~/modules/pos/pos-items/graphql/queries/queries';
import { IPosItem } from '@/pos/pos-items/types/posItem';
import {
  useMultiQueryState,
  parseDateRangeFromString,
  useQueryState,
} from 'erxes-ui';
import { useMemo, useCallback, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { posItemsTotalCountAtom } from '../states/usePosItemsCounts';

const POS_PER_PAGE = 30;

interface UsePosItemsListOptions {
  posId?: string;
  [key: string]: any;
}

interface UsePosItemsListReturn {
  loading: boolean;
  posItemList: IPosItem[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const usePosItemsVariables = (options: UsePosItemsListOptions = {}) => {
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

export const usePosItemsList = (
  options: UsePosItemsListOptions = {},
): UsePosItemsListReturn => {
  const variables = usePosItemsVariables(options);
  const setPosItemsTotalCount = useSetAtom(posItemsTotalCountAtom);

  const { data, loading, fetchMore } = useQuery(
    queries.POS_ORDER_RECORDS_QUERY,
    {
      variables,
    },
  );

  const posItemList = useMemo<IPosItem[]>(
    () =>
      data?.posOrderRecords?.map((posItem: IPosItem) => ({
        ...posItem,
      })) || [],
    [data?.posOrderRecords],
  );
  const totalCount = useMemo(
    () => data?.posOrderRecords?.totalCount || 0,
    [data?.posOrderRecords?.totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.posOrderRecords) return;

    fetchMore({
      variables: {
        page: Math.ceil(posItemList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.posOrderRecords) {
          return prev;
        }
        return {
          ...prev,
          posOrderRecords: [
            ...(prev.posOrderRecords || []),
            ...fetchMoreResult.posOrderRecords,
          ],
          totalCount: fetchMoreResult.posOrderRecords.totalCount,
        };
      },
    });
  }, [posItemList.length, fetchMore, data?.posOrderRecords]);

  useEffect(() => {
    if (!totalCount) return;
    setPosItemsTotalCount(totalCount);
  }, [totalCount, setPosItemsTotalCount]);

  return {
    loading,
    posItemList,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: posItemList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
