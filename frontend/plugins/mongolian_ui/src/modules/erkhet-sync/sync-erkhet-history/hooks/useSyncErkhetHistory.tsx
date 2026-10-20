import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
  isUndefinedOrNull,
} from 'erxes-ui';
import { toSyncHistory } from '../types/syncHistory';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import type {
  ErkhetSyncHistoriesQuery,
  ErkhetSyncHistoriesQueryVariables,
} from '~/gql/graphql';
import { syncErkhetHistoryQuery } from '../graphql/queries/syncErkhetHistoryQuery';
import { useSyncErkhetHistoryLeadSessionKey } from '../hooks/useSyncErkhetHistoryLeadSessionKey';
import { syncErkhetHistoryTotalCountAtom } from '../states/syncErkhetHistoryCounts';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
export const SYNC_HISTORIES_PER_PAGE = 30;
export const useSyncErkhetHistoryVariables = (
  variables?: ErkhetSyncHistoriesQueryVariables,
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
    searchConsume: String(searchConsume ?? '') || undefined,
    searchSend: String(searchSend ?? '') || undefined,
    searchResponse: String(searchResponse ?? '') || undefined,
    searchError: String(searchError ?? '') || undefined,
    contentType: String(contentType ?? '') || undefined,
    contentId: String(contentId ?? '') || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    type: isHistory ? 'syncErkhetHistory' : 'isSyncErkhetHistory',
    userId: user || undefined,
    ...variables,
  };
};
export const useSyncErkhetHistory = (
  options?: QueryHookOptions<
    ErkhetSyncHistoriesQuery,
    ErkhetSyncHistoriesQueryVariables
  >,
) => {
  const setSyncErkhetHistoryTotalCount = useSetAtom(
    syncErkhetHistoryTotalCountAtom,
  );
  const variables = useSyncErkhetHistoryVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery(syncErkhetHistoryQuery, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
    fetchPolicy: 'network-only',
  });
  const SyncHistories = compactList(data?.syncHistories?.list).map(
    toSyncHistory,
  );
  const totalCount = data?.syncHistories?.totalCount;
  const pageInfo = toCursorPageInfo(data?.syncHistories?.pageInfo);
  useEffect(() => {
    setSyncErkhetHistoryTotalCount(totalCount ?? null);
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
        if (!fetchMoreResult.syncHistories || !prev.syncHistories) {
          return prev;
        }
        return {
          ...prev,
          syncHistories: mergeCursorList(
            direction,
            prev.syncHistories,
            fetchMoreResult.syncHistories,
          ),
        };
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
