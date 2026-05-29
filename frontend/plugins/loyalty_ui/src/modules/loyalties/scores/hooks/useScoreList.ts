import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo } from 'react';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { parseDateRangeFromString } from 'erxes-ui/modules/filter/date-filter/utils/parseDateRangeFromString';
import { useSetAtom } from 'jotai';
import { SCORE_LOGS_QUERY } from '../graphql/queries';
import { IScoreLog } from '../types/score';
import { scoreTotalCountAtom } from '../states/scoreCounts';

const SCORE_PER_PAGE = 50;
export const SCORE_LOG_CURSOR_SESSION_KEY = 'score_logs_cursor';

export const useScoreList = () => {
  const setTotalCount = useSetAtom(scoreTotalCountAtom);

  const [
    {
      scoreOwnerType,
      scoreOwnerId,
      scoreCampaignId,
      scoreDate,
      scoreOrderType,
      scoreAction,
      scoreBoardId,
      scorePipelineId,
      scoreStageId,
      number,
      description,
    },
  ] = useMultiQueryState<{
    scoreOwnerType: string;
    scoreOwnerId: string;
    scoreCampaignId: string;
    scoreDate: string;
    scoreOrderType: string;
    scoreAction: string;
    scoreBoardId: string;
    scorePipelineId: string;
    scoreStageId: string;
    number: string;
    description: string;
  }>([
    'scoreOwnerType',
    'scoreOwnerId',
    'scoreCampaignId',
    'scoreDate',
    'scoreOrderType',
    'scoreAction',
    'scoreBoardId',
    'scorePipelineId',
    'scoreStageId',
    'number',
    'description',
  ]);

  const dateRange = parseDateRangeFromString(scoreDate);

  const variables = useMemo(
    () => ({
      ownerType: scoreOwnerType || undefined,
      ownerId: scoreOwnerId || undefined,
      campaignId: scoreCampaignId || undefined,
      fromDate: dateRange?.from?.toISOString() || undefined,
      toDate: dateRange?.to?.toISOString() || undefined,
      orderType: scoreOrderType || undefined,
      action: scoreAction || undefined,
      boardId: scoreBoardId || undefined,
      pipelineId: scorePipelineId || undefined,
      stageId: scoreStageId || undefined,
      number: number || undefined,
      description: description || undefined,
      limit: SCORE_PER_PAGE,
    }),
    [
      scoreOwnerType,
      scoreOwnerId,
      scoreCampaignId,
      dateRange?.from,
      dateRange?.to,
      scoreOrderType,
      scoreAction,
      scoreBoardId,
      scorePipelineId,
      scoreStageId,
      number,
      description,
    ],
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
