import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
  isUndefinedOrNull,
} from 'erxes-ui';
import { ISyncHistory } from '../types/syncHistory';
import { syncErkhetHistoryQuery } from '../graphql/queries/syncErkhetHistoryQuery';
import { useSyncErkhetHistoryLeadSessionKey } from '../hooks/useSyncErkhetHistoryLeadSessionKey';
import { syncErkhetHistoryTotalCountAtom } from '../states/syncErkhetHistoryCounts';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

export const SYNC_HISTORIES_PER_PAGE = 30;

export const useSyncErkhetHistoryVariables = (
  variables?: QueryHookOptions<{
    syncHistories: {
      list: ISyncHistory[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const { isHistory } = useSyncErkhetHistoryLeadSessionKey();
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
    contentType: string;
    contentId: string;
    searchConsume: string;
    searchSend: string;
    searchResponse: string;
    searchError: string;
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
  const { sessionKey } = useSyncErkhetHistoryLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey,
  });

  return {
    limit: SYNC_HISTORIES_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    searchConsume: searchConsume || undefined,
    searchSend: searchSend || undefined,
    searchResponse: searchResponse || undefined,
    searchError: searchError || undefined,
    contentType: contentType || undefined,
    contentId: contentId || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    type: isHistory ? 'syncErkhetHistory' : 'isSyncErkhetHistory',
    userId: user || undefined,
    ...variables,
  };
};
export const useSyncErkhetHistory = (
  options?: QueryHookOptions<{
    syncHistories: {
      list: ISyncHistory[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>,
) => {
  const setSyncErkhetHistoryTotalCount = useSetAtom(
    syncErkhetHistoryTotalCountAtom,
  );
  const variables = useSyncErkhetHistoryVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<{
    syncHistories: {
      list: ISyncHistory[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(syncErkhetHistoryQuery, {
    ...options,
    variables: {
      skip: options?.skip || isUndefinedOrNull(variables.cursor),
      ...variables,
    },
  });

  const {
    list: SyncHistories,
    totalCount,
    pageInfo,
  } = data?.syncHistories || {};

  useEffect(() => {
    if (!totalCount) return;
    setSyncErkhetHistoryTotalCount(totalCount);
  }, [totalCount, setSyncErkhetHistoryTotalCount]);

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
        limit: SYNC_HISTORIES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          syncHistories: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.syncHistories,
              prevResult: prev.syncHistories,
            }),
            totalCount: fetchMoreResult.syncHistories.totalCount,
          },
        });
      },
    });
  };

  return {
    loading,
    SyncHistories,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
