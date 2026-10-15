import { useQuery } from '@apollo/client';
import { isRecord } from '@/loyalties/utils/isRecord';
import { SCORE_LOG_STATISTICS_QUERY } from '../graphql/queries';
import { useScoreFilters } from './useScoreFilters';

export type ScoreStats = {
  totalPointEarned?: number;
  totalPointBalance?: number;
  totalPointRedeemed?: number;
  redemptionRate?: number;
  activeLoyaltyMembers?: number;
  monthlyActiveUsers?: number;
  mostRedeemedProductCategory?: string;
};

const number = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

const parseScoreStats = (value: unknown): ScoreStats =>
  isRecord(value)
    ? {
        totalPointEarned: number(value.totalPointEarned),
        totalPointBalance: number(value.totalPointBalance),
        totalPointRedeemed: number(value.totalPointRedeemed),
        redemptionRate: number(value.redemptionRate),
        activeLoyaltyMembers: number(value.activeLoyaltyMembers),
        monthlyActiveUsers: number(value.monthlyActiveUsers),
        mostRedeemedProductCategory:
          typeof value.mostRedeemedProductCategory === 'string'
            ? value.mostRedeemedProductCategory
            : undefined,
      }
    : {};

/**
 * Runs the statistics query with the same URL filters used by the scores table,
 * so the Score Summary reflects exactly the filtered rows instead of the whole
 * collection.
 */
export const useScoreStatistics = () => {
  const variables = useScoreFilters();

  const { data, loading } = useQuery(SCORE_LOG_STATISTICS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables,
  });

  return {
    stats: parseScoreStats(data?.scoreLogStatistics),
    loading,
  };
};
