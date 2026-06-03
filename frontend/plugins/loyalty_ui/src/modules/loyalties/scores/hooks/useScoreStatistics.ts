import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { useMultiQueryState } from 'erxes-ui';
import { parseDateRangeFromString } from 'erxes-ui/modules/filter/date-filter/utils/parseDateRangeFromString';
import { SCORE_LOG_STATISTICS_QUERY } from '../graphql/queries';

export type ScoreStats = {
  totalPointEarned?: number;
  totalPointBalance?: number;
  totalPointRedeemed?: number;
  redemptionRate?: number;
  activeLoyaltyMembers?: number;
  monthlyActiveUsers?: number;
  mostRedeemedProductCategory?: string;
};

/**
 * Reads the same URL filters used by the scores table (`useScoreList`) and runs
 * the statistics query with them, so the Score Summary reflects exactly the
 * filtered rows shown in the table instead of the whole collection.
 */
export const useScoreStatistics = () => {
  const [
    {
      scoreOwnerType,
      scoreOwnerId,
      scoreCampaignId,
      scoreDate,
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
      action: scoreAction || undefined,
      boardId: scoreBoardId || undefined,
      pipelineId: scorePipelineId || undefined,
      stageId: scoreStageId || undefined,
      number: number != null && number !== '' ? String(number) : undefined,
      description: description || undefined,
    }),
    [
      scoreOwnerType,
      scoreOwnerId,
      scoreCampaignId,
      dateRange?.from,
      dateRange?.to,
      scoreAction,
      scoreBoardId,
      scorePipelineId,
      scoreStageId,
      number,
      description,
    ],
  );

  const { data, loading } = useQuery(SCORE_LOG_STATISTICS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables,
  });

  return {
    stats: (data?.scoreLogStatistics || {}) as ScoreStats,
    loading,
  };
};
