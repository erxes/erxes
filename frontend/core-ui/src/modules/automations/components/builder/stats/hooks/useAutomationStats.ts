import { AUTOMATION_STATS } from '@/automations/components/builder/stats/graphql/automationStatsQueries';
import { TAutomationStats } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { useParams } from 'react-router';

/**
 * Stats follow the same date filter as the history list, so the numbers on the
 * page always describe the rows below them.
 */
export const useAutomationStats = (skip?: boolean) => {
  const { id } = useParams();
  const [queries] = useMultiQueryState<{ createdAt: string }>(['createdAt']);
  const range = parseDateRangeFromString(queries.createdAt);

  const { data, loading, error, refetch } = useQuery<{
    automationStats: TAutomationStats;
  }>(AUTOMATION_STATS, {
    variables: {
      automationId: id,
      beginDate: range?.from,
      endDate: range?.to,
    },
    skip: skip || !id,
  });

  return {
    stats: data?.automationStats,
    loading,
    error,
    refetch,
  };
};
