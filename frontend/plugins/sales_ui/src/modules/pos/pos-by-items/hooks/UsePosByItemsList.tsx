import { useQuery } from '@apollo/client';
import { POS_BY_ITEMS_QUERY } from '@/pos/pos-by-items/graphql/queries';
import { IProduct } from '@/pos/pos-by-items/types/PosByItemType';
import { useMemo, useCallback, useEffect } from 'react';
import {
  useMultiQueryState,
  parseDateRangeFromString,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { posByItemsTotalCountAtom } from '../states/usePosByItemsCounts';

const POS_PER_PAGE = 30;

interface UsePosByItemsListOptions {
  posId?: string;
  [key: string]: any;
}

interface UsePosByItemsListReturn {
  loading: boolean;
  posByItemsList: IProduct[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const usePosByItemsVariables = (
  options: UsePosByItemsListOptions = {},
) => {
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
  const customerIdValue = customer || company || undefined;

  console.log('PosByItems Variables:', {
    customer,
    company,
    customerIdValue,
    searchValue,
    pos,
    types,
    status,
  });

  return {
    perPage: POS_PER_PAGE,
    ...(posId && { posId }),
    search: (() => {
      const searchParts = [];
      if (searchValue) searchParts.push(searchValue);
      if (number) searchParts.push(number);
      return searchParts.length > 0 ? searchParts.join(' ') : undefined;
    })(),
    customerId: customerIdValue,
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

export const usePosByItemsList = (
  options: UsePosByItemsListOptions = {},
): UsePosByItemsListReturn => {
  const variables = usePosByItemsVariables(options);
  const setPosByItemsTotalCount = useSetAtom(posByItemsTotalCountAtom);
  const { data, loading, fetchMore } = useQuery(POS_BY_ITEMS_QUERY, {
    variables,
  });

  const posByItemsList = useMemo<IProduct[]>(
    () => data?.posProducts?.products || [],
    [data?.posProducts?.products],
  );

  const totalCount = useMemo(
    () => data?.posProducts?.totalCount || 0,
    [data?.posProducts?.totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.posProducts) return;

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(posByItemsList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.posProducts) {
          return prev;
        }
        return {
          ...prev,
          posProducts: {
            ...prev.posProducts,
            products: [
              ...(prev.posProducts?.products || []),
              ...fetchMoreResult.posProducts.products,
            ],
            totalCount: fetchMoreResult.posProducts.totalCount,
          },
        };
      },
    });
  }, [posByItemsList.length, fetchMore, data?.posProducts, variables]);

  useEffect(() => {
    if (!totalCount) return;
    setPosByItemsTotalCount(totalCount);
  }, [totalCount, setPosByItemsTotalCount]);

  return {
    loading,
    posByItemsList,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: posByItemsList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
