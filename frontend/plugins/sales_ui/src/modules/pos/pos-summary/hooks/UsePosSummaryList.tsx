import { useQuery } from '@apollo/client';
import queries from '~/modules/pos/pos-summary/graphql/queries/queries';
import { IPosSummary } from '@/pos/pos-summary/types/posSummary';
import {
  useMultiQueryState,
  parseDateRangeFromString,
  useQueryState,
} from 'erxes-ui';
import { useMemo, useCallback, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { posSummaryTotalCountAtom } from '../states/usePosSummaryCounts';

const POS_PER_PAGE = 30;

interface UsePosSummaryListOptions {
  posId?: string;
  [key: string]: any;
}

interface UsePosSummaryListReturn {
  loading: boolean;
  posSummaryList: IPosSummary[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const usePosSummaryVariables = (
  options: UsePosSummaryListOptions = {},
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

export const usePosSummaryList = (
  options: UsePosSummaryListOptions = {},
): UsePosSummaryListReturn => {
  const variables = usePosSummaryVariables(options);
  const setPosSummaryTotalCount = useSetAtom(posSummaryTotalCountAtom);

  const { data, loading, fetchMore } = useQuery(
    queries.POS_ORDER_GROUP_SUMMARY,
    { variables },
  );

  const posSummaryList = useMemo<IPosSummary[]>(
    () =>
      data?.posOrdersGroupSummary?.amounts?.map((item: any) => ({
        _id: item._id,
        paidDate: item.paidDate || 'N/A',
        number: item._id,
        billId: '',
        cashAmount: item.cashAmount || 0,
        mobileAmount: item.mobileAmount || 0,
        totalAmount: item.totalAmount || 0,
        finalAmount: item.finalAmount || 0,
        amounts: {
          count: item.count || 0,
          cashAmount: item.cashAmount || 0,
          mobileAmount: item.mobileAmount || 0,
          invoice: item.invoice || 0,
        },
      })) || [],
    [data?.posOrdersGroupSummary?.amounts],
  );
  const totalCount = useMemo(
    () => data?.posOrdersGroupSummary?.amounts?.length || 0,
    [data?.posOrdersGroupSummary?.amounts],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.posOrdersGroupSummary?.amounts?.length) return;

    fetchMore({
      variables: {
        page: Math.ceil(posSummaryList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.posOrdersGroupSummary?.amounts) {
          return prev;
        }
        return {
          ...prev,
          posOrdersGroupSummary: {
            amounts: [
              ...(prev.posOrdersGroupSummary?.amounts || []),
              ...(fetchMoreResult.posOrdersGroupSummary?.amounts || []),
            ],
            columns:
              fetchMoreResult.posOrdersGroupSummary?.columns ||
              prev.posOrdersGroupSummary?.columns,
          },
        };
      },
    });
  }, [posSummaryList.length, fetchMore, data?.posOrdersGroupSummary]);

  useEffect(() => {
    if (!totalCount) return;
    setPosSummaryTotalCount(totalCount);
  }, [totalCount, setPosSummaryTotalCount]);

  return {
    loading,
    posSummaryList,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: posSummaryList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
