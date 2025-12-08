import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { checkSyncedDealsQuery } from '../graphql/queries/checkSyncedDealsQuery';
import { ICheckSyncedDeals } from '../types/checkSyncedDeals';
import { useCheckSyncedDealsLeadSessionKey } from './useCheckSyncedDealsLeadSessionKey';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { checkSyncedDealsTotalCountAtom } from '../states/checkSyncedDealsCounts';

export const CHECK_SYNCED_DEALS_PER_PAGE = 30;

export const useCheckSyncedDealsVariables = (
  variables?: QueryHookOptions<{
    deals: {
      list: ICheckSyncedDeals[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const [
    {
      user,
      boardId,
      pipelineId,
      stageId,
      dealSearch,
      number,
      stageChangedDateRange,
      dateType,
      dateRange,
    },
  ] = useMultiQueryState<{
    user: string;
    boardId: string;
    pipelineId: string;
    stageId: string;
    dealSearch: string;
    number: string;
    stageChangedDateRange: string;
    dateType: string;
    dateRange: string;
  }>([
    'user',
    'boardId',
    'pipelineId',
    'stageId',
    'dealSearch',
    'number',
    'stageChangedDateRange',
    'dateType',
    'dateRange',
  ]);
  const { sessionKey } = useCheckSyncedDealsLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey,
  });

  return {
    limit: CHECK_SYNCED_DEALS_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    number: number || undefined,
    search: dealSearch || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    dateFilters: stageChangedDateRange
      ? JSON.stringify({
          [dateType || 'createdAt']: {
            gte: parseDateRangeFromString(stageChangedDateRange)?.from,
            lte: parseDateRangeFromString(stageChangedDateRange)?.to,
          },
        })
      : undefined,
    type: 'checkSyncedDeals',

    userIds: user ? [user] : undefined,
    boardId: boardId || undefined,
    pipelineId: pipelineId || undefined,
    stageId: stageId || undefined,
    ...variables,
  };
};
export const useCheckSyncedDeals = (options?: QueryHookOptions) => {
  const setCheckSyncedDealsTotalCount = useSetAtom(
    checkSyncedDealsTotalCountAtom,
  );
  const variables = useCheckSyncedDealsVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<{
    deals: {
      list: ICheckSyncedDeals[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(checkSyncedDealsQuery, {
    ...options,
    variables: {
      skip: options?.skip || isUndefinedOrNull(variables.cursor),
      ...variables,
    },
  });

  const { list: Deals, totalCount, pageInfo } = data?.deals || {};
  useEffect(() => {
    if (!totalCount) return;
    setCheckSyncedDealsTotalCount(totalCount);
  }, [totalCount, setCheckSyncedDealsTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CHECK_SYNCED_DEALS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          deals: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.deals,
              prevResult: prev.deals,
            }),
            totalCount: fetchMoreResult.deals.totalCount,
          },
        };
      },
    });
  };

  return {
    loading,
    Deals,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
