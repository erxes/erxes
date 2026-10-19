import { NetworkStatus, useQuery } from '@apollo/client';
import { isDefined, TSearchSortOrder } from 'erxes-ui';

import { GET_DEALS_SEARCH_DROPDOWN } from '@/deals/graphql/queries/DealsQueries';
import { useCallback } from 'react';

const DEALS_PER_PAGE = 20;

export type TDealSearchSortOrder = TSearchSortOrder;

export type TDealSearchDateRange = {
  from?: Date;
  to?: Date;
};

export const useDealSearch = (
  search: string,
  sortOrder: TDealSearchSortOrder,
  dateRange?: TDealSearchDateRange,
  dealNumber?: string,
) => {
  const endDateSource = dateRange?.to ?? dateRange?.from;
  const createdEndDate = endDateSource ? new Date(endDateSource) : undefined;

  createdEndDate?.setHours(23, 59, 59, 999);

  const { data, loading, fetchMore, networkStatus } = useQuery(
    GET_DEALS_SEARCH_DROPDOWN,
    {
      variables: {
        search,
        number: dealNumber,
        createdStartDate: dateRange?.from,
        createdEndDate,
        noSkipArchive: true,
        limit: DEALS_PER_PAGE,
        direction: 'forward',
        orderBy: { createdAt: sortOrder === 'oldest' ? 1 : -1 },
      },
      skip: search.length < 2 && !dateRange?.from && !dealNumber,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  const { pageInfo } = data?.deals || {};
  const deals = data?.deals?.list?.filter(isDefined) ?? [];
  const totalCount = data?.deals?.totalCount ?? 0;
  const loadingMore = networkStatus === NetworkStatus.fetchMore;

  const loadMore = useCallback(() => {
    if (
      !pageInfo?.hasNextPage ||
      !pageInfo.endCursor ||
      loadingMore ||
      deals.length >= totalCount
    ) {
      return;
    }

    void fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
        direction: 'forward',
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult.deals) {
          return previousResult;
        }

        const dealsById = new Map(
          (previousResult.deals?.list?.filter(isDefined) ?? []).map((deal) => [
            deal._id,
            deal,
          ]),
        );

        for (const deal of fetchMoreResult.deals.list?.filter(isDefined) ??
          []) {
          dealsById.set(deal._id, deal);
        }

        return {
          deals: {
            ...fetchMoreResult.deals,
            list: Array.from(dealsById.values()),
          },
        };
      },
    });
  }, [deals.length, fetchMore, loadingMore, pageInfo, totalCount]);

  return {
    deals,
    loading,
    loadingMore,
    totalCount,
    pageInfo,
    loadMore,
  };
};
