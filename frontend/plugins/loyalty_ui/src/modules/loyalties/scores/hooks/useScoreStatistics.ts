import { useQuery } from '@apollo/client';
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
    stats: (data?.scoreLogStatistics || {}) as ScoreStats,
    loading,
  };
};
