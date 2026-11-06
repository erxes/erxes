import { AUTOMATION_STATS } from '@/automations/components/builder/stats/graphql/automationStatsQueries';
import { TAutomationStats } from '@/automations/types';
import { useQuery } from '@apollo/client';

/**
 * Every number on the stats page describes one window, so the totals and the
 * chart can never end up talking about different periods.
 */
export const useAutomationStats = ({
  automationId,
  beginDate,
  endDate,
}: {
  automationId?: string;
  beginDate: Date;
  endDate: Date;
}) => {
  const { data, loading, error, refetch } = useQuery<{
    automationStats: TAutomationStats;
  }>(AUTOMATION_STATS, {
    variables: { automationId, beginDate, endDate },
    skip: !automationId,
  });

  return {
    stats: data?.automationStats,
    loading,
    error,
    refetch,
  };
};
