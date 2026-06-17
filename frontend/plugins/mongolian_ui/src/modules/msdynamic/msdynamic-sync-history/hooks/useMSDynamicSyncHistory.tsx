import { gql, QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
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
import { queries } from '../../graphql';
import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { msDynamicSyncHistoryTotalCountAtom } from '../states/msDynamicSyncHistoryCounts';
import { IMSDynamicSyncHistory } from '../types/msDynamicSyncHistory';

export const MS_DYNAMIC_SYNC_HISTORIES_PER_PAGE = 20;

type TMSDynamicSyncHistoryQueryResponse = {
  syncMsdHistories: {
    list: IMSDynamicSyncHistory[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
};

export const useMSDynamicSyncHistoryVariables = (
  variables?: QueryHookOptions<TMSDynamicSyncHistoryQueryResponse>['variables'],
) => {
  const [
    {
      user,
      dateRange,
      contentType,
      contentId,
      searchConsume,
      searchSend,
      searchResponse,
      searchError,
    },
  ] = useMultiQueryState<{
    user: string;
    dateRange: string;
    contentType: string | number;
    contentId: string | number;
    searchConsume: string | number;
    searchSend: string | number;
    searchResponse: string | number;
    searchError: string | number;
  }>([
    'user',
    'dateRange',
    'contentType',
    'contentId',
    'searchConsume',
    'searchSend',
    'searchResponse',
    'searchError',
  ]);
  const { sessionKey } = useMSDynamicSessionKey('syncHistory');
  const { cursor } = useRecordTableCursor({ sessionKey });

  return {
    limit: MS_DYNAMIC_SYNC_HISTORIES_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    searchConsume: String(searchConsume ?? '') || undefined,
    searchSend: String(searchSend ?? '') || undefined,
    searchResponse: String(searchResponse ?? '') || undefined,
    searchError: String(searchError ?? '') || undefined,
    contentType: String(contentType ?? '') || undefined,
    contentId: String(contentId ?? '') || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    userId: user || undefined,
    ...variables,
  };
};

export const useMSDynamicSyncHistory = (
  options?: QueryHookOptions<TMSDynamicSyncHistoryQueryResponse>,
) => {
  const setTotalCount = useSetAtom(msDynamicSyncHistoryTotalCountAtom);
  const variables = useMSDynamicSyncHistoryVariables(options?.variables);

  const { data, loading, fetchMore } =
    useQuery<TMSDynamicSyncHistoryQueryResponse>(
      gql(queries.syncMsdHistories),
      {
        ...options,
        skip: options?.skip || isUndefinedOrNull(variables.cursor),
        variables,
        fetchPolicy: 'network-only',
      },
    );

  const {
    list: syncHistories,
    totalCount,
    pageInfo,
  } = data?.syncMsdHistories || {};

  useEffect(() => {
    setTotalCount(totalCount ?? null);
  }, [setTotalCount, totalCount]);

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
        limit: MS_DYNAMIC_SYNC_HISTORIES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          ...prev,
          syncMsdHistories: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.syncMsdHistories,
              prevResult: prev.syncMsdHistories,
            }),
            totalCount: fetchMoreResult.syncMsdHistories.totalCount,
          },
        };
      },
    });
  };

  return {
    loading,
    syncHistories,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
