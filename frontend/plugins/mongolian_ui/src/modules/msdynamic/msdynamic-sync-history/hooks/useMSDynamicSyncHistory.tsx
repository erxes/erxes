import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { queries } from '../../graphql';
import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { msDynamicSyncHistoryTotalCountAtom } from '../states/msDynamicSyncHistoryCounts';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import { toMSDynamicSyncHistory } from '../types/msDynamicSyncHistory';
import type {
  MsdynamicSyncHistoriesQuery,
  MsdynamicSyncHistoriesQueryVariables,
} from '~/gql/graphql';

export const MS_DYNAMIC_SYNC_HISTORIES_PER_PAGE = 20;

type TMSDynamicSyncHistoryQueryOptions = QueryHookOptions<
  MsdynamicSyncHistoriesQuery,
  MsdynamicSyncHistoriesQueryVariables
>;

export const useMSDynamicSyncHistoryVariables = (
  variables?: TMSDynamicSyncHistoryQueryOptions['variables'],
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
  options?: TMSDynamicSyncHistoryQueryOptions,
) => {
  const setTotalCount = useSetAtom(msDynamicSyncHistoryTotalCountAtom);
  const variables = useMSDynamicSyncHistoryVariables(options?.variables);

  const { data, loading, fetchMore } = useQuery(queries.syncMsdHistories, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
    fetchPolicy: 'network-only',
  });

  const syncHistories = compactList(data?.syncMsdHistories?.list).map(
    toMSDynamicSyncHistory,
  );
  const totalCount = data?.syncMsdHistories?.totalCount;
  const pageInfo = toCursorPageInfo(data?.syncMsdHistories?.pageInfo);

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
        if (!fetchMoreResult.syncMsdHistories || !prev.syncMsdHistories) {
          return prev;
        }

        return {
          ...prev,
          syncMsdHistories: mergeCursorList(
            direction,
            prev.syncMsdHistories,
            fetchMoreResult.syncMsdHistories,
          ),
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
