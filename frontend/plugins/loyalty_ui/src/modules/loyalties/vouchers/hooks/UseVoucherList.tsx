import * as queries from '~/modules/loyalties/vouchers/graphql/queries/queries';
import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import { IVoucher } from '@/loyalties/vouchers/types/voucher';
import { useMultiQueryState, useQueryState } from 'erxes-ui';
import { parseDateRangeFromString } from 'erxes-ui/modules/filter/date-filter/utils/parseDateRangeFromString';
import { useSetAtom } from 'jotai';
import { voucherTotalCountAtom } from '../states/useVoucherCounts';

const VOUCHER_PER_PAGE = 30;

interface UseVouchersListOptions {
  [key: string]: string | number | boolean | string[] | undefined;
}

interface UseVouchersListReturn {
  loading: boolean;
  vouchersList: IVoucher[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const useVouchersVariables = (options: UseVouchersListOptions = {}) => {
  const [
    {
      status,
      voucherCampaignId,
      ownerType,
      searchValue,
      date,
      orderType,
      sortField: sortFieldQuery,
    },
  ] = useMultiQueryState<{
    status: string;
    voucherCampaignId: string;
    ownerType: string;
    searchValue: string;
    date: string;
    orderType: string;
    sortField: string;
  }>([
    'status',
    'voucherCampaignId',
    'ownerType',
    'searchValue',
    'date',
    'orderType',
    'sortField',
  ]);

  const [ownerId] = useQueryState<string>('ownerId');

  const dateRange = parseDateRangeFromString(date);

  const sortField = sortFieldQuery || (orderType ? 'createdAt' : undefined);
  let sortDirection: number | undefined;
  if (orderType === 'ascending') sortDirection = 1;
  else if (orderType === 'descending') sortDirection = -1;

  return {
    perPage: VOUCHER_PER_PAGE,
    campaignId: voucherCampaignId || undefined,
    ownerId: ownerId || undefined,
    ownerType: ownerType || undefined,
    status: status && status !== 'all' ? status : undefined,
    searchValue: searchValue || undefined,
    fromDate: dateRange?.from?.toISOString() || undefined,
    toDate: dateRange?.to?.toISOString() || undefined,
    sortField,
    sortDirection,
    ...options,
  };
};

export const useVouchersList = (
  options: UseVouchersListOptions = {},
): UseVouchersListReturn => {
  const variables = useVouchersVariables(options);
  const setVouchersTotalCount = useSetAtom(voucherTotalCountAtom);

  const { data, loading, fetchMore } = useQuery(queries.VOUCHERS_QUERY, {
    variables,
  });

  const vouchersList = useMemo<IVoucher[]>(
    () => data?.vouchersMain?.list || [],
    [data?.vouchersMain?.list],
  );

  const totalCount = useMemo(
    () => data?.vouchersMain?.totalCount || 0,
    [data?.vouchersMain?.totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.vouchersMain) return;

    fetchMore({
      variables: {
        page: Math.ceil(vouchersList.length / VOUCHER_PER_PAGE) + 1,
        perPage: VOUCHER_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.vouchersMain?.list) return prev;
        return {
          ...prev,
          vouchersMain: {
            ...fetchMoreResult.vouchersMain,
            list: [
              ...(prev.vouchersMain?.list || []),
              ...fetchMoreResult.vouchersMain.list,
            ],
          },
        };
      },
    });
  }, [vouchersList.length, fetchMore, data?.vouchersMain]);

  useEffect(() => {
    if (totalCount === undefined) return;
    setVouchersTotalCount(totalCount);
  }, [totalCount, setVouchersTotalCount]);

  return {
    loading,
    vouchersList,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: vouchersList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
