import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo } from 'react';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { SCORE_LOGS_QUERY } from '../graphql/queries';
import { IScoreLog } from '../types/score';
import { scoreTotalCountAtom } from '../states/scoreCounts';
import { useScoreFilters } from './useScoreFilters';
import { SCORE_CURSOR_SESSION_KEY } from '../constants/scoreCursorSessionKey';

const SCORE_PER_PAGE = 50;
// Must match the key the ScoreFilter uses (see useScoreLeadSessionKey), so that
// changing a filter resets the table cursor and we always refetch from the
// first page instead of a stale cursor that returns an empty/wrong page.
export const SCORE_LOG_CURSOR_SESSION_KEY = SCORE_CURSOR_SESSION_KEY;

export const useScoreList = () => {
  const setTotalCount = useSetAtom(scoreTotalCountAtom);

  const filters = useScoreFilters();

  const [{ scoreOrderType }] = useMultiQueryState<{ scoreOrderType: string }>([
    'scoreOrderType',
  ]);

  const variables = useMemo(
    () => ({
      ...filters,
      orderType: scoreOrderType || undefined,
      limit: SCORE_PER_PAGE,
    }),
    [filters, scoreOrderType],
  );

  const { cursor } = useRecordTableCursor({
    sessionKey: SCORE_LOG_CURSOR_SESSION_KEY,
  });

  const { data, loading, refetch, fetchMore } = useQuery(SCORE_LOGS_QUERY, {
    variables: { ...variables, cursor },
    notifyOnNetworkStatusChange: true,
  });

  const list = useMemo<IScoreLog[]>(
    () => data?.scoreLogs?.list || [],
    [data?.scoreLogs?.list],
  );

  const total = useMemo<number>(
    () => data?.scoreLogs?.totalCount || 0,
    [data?.scoreLogs?.totalCount],
  );

  const pageInfo = data?.scoreLogs?.pageInfo;

  const handleFetchMore = useCallback(
    ({ direction }: { direction: EnumCursorDirection }) => {
      if (!validateFetchMore({ direction, pageInfo })) return;

      fetchMore({
        variables: {
          ...variables,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.scoreLogs) return prev;

          return {
            scoreLogs: {
              ...mergeCursorData({
                direction,
                fetchMoreResult: fetchMoreResult.scoreLogs,
                prevResult: prev.scoreLogs,
              }),
              totalCount:
                fetchMoreResult.scoreLogs.totalCount ??
                prev.scoreLogs.totalCount,
            },
          };
        },
      });
    },
    [fetchMore, pageInfo, variables],
  );

  useEffect(() => {
    setTotalCount(total);
  }, [total, setTotalCount]);

  return {
    list,
    total,
    loading,
    refetch,
    handleFetchMore,
    pageInfo,
  };
};
