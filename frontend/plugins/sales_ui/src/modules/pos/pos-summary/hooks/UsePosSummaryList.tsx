import { IPosSummary } from '@/pos/pos-summary/types/posSummary';
import {
  mergePosSummaryPages,
  posSummarySchema,
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
import { queries } from '~/modules/pos/pos-summary/graphql/queries/queries';
import { posSummaryTotalCountAtom } from '../states/usePosSummaryCounts';

const POS_PER_PAGE = 30;

interface UsePosSummaryListOptions {
  posId?: string;
  [key: string]: unknown;
}

interface UsePosSummaryListReturn {
  loading: boolean;
  error?: Error;
  posSummaryList: IPosSummary[];
  totalCount: number;
  columns: Record<string, string>;
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
      groupField,
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
    groupField: string;
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
    'groupField',
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
    groupField: groupField && groupField !== 'all' ? groupField : undefined,
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

  const { data, loading, error, fetchMore } = useQuery(
    queries.POS_ORDER_GROUP_SUMMARY,
    { variables },
  );

  const parsed = useMemo(
    () =>
      readPosData(() =>
        posSummarySchema.parse(data?.posOrdersGroupSummary ?? {}),
      ),
    [data?.posOrdersGroupSummary],
  );
  const summary = parsed.value;

  const posSummaryList = useMemo<IPosSummary[]>(
    () =>
      summary?.amounts?.map((item) => {
        const groupKey = item.paidDate || '-';
        return {
          _id: groupKey,
          paidDate: groupKey,
          number: groupKey,
          billId: '',
          cashAmount: Number(item.cashAmount) || 0,
          mobileAmount: Number(item.mobileAmount) || 0,
          totalAmount: Number(item.totalAmount) || 0,
          finalAmount: Number(item.finalAmount) || 0,
          amounts: {
            count: Number(item.count) || 0,
            cashAmount: Number(item.cashAmount) || 0,
            mobileAmount: Number(item.mobileAmount) || 0,
            invoice: Number(item.invoice) || 0,
            qpayAmount: Number(item.qpayAmount) || 0,
          },
        };
      }) || [],
    [summary?.amounts],
  );
  const totalCount = useMemo(
    () => summary?.amounts?.length || 0,
    [summary?.amounts],
  );

  const handleFetchMore = useCallback(() => {
    if (!summary?.amounts?.length) return;

    fetchMore({
      variables: {
        page: Math.ceil(posSummaryList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) =>
        mergePosSummaryPages(prev, fetchMoreResult),
    });
  }, [posSummaryList.length, fetchMore, summary?.amounts?.length]);

  useEffect(() => {
    if (!totalCount) return;
    setPosSummaryTotalCount(totalCount);
  }, [totalCount, setPosSummaryTotalCount]);

  const columns = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(summary?.columns ?? {}).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      ),
    [summary?.columns],
  );

  return {
    loading,
    error: error ?? parsed.error,
    posSummaryList,
    totalCount,
    columns,
    handleFetchMore,
    pageInfo: {
      hasNextPage: posSummaryList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
