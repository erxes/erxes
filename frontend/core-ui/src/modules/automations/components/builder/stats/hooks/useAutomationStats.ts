import { AUTOMATION_STATS } from '@/automations/components/builder/stats/graphql/automationStatsQueries';
import { useAutomationStatsWindow } from '@/automations/components/builder/stats/hooks/useAutomationStatsWindow';
import { TAutomationStats } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';

/**
 * Every number on the stats page describes one window, so the totals and the
 * chart can never end up talking about different periods.
 */
export const useAutomationStats = (skip?: boolean) => {
  const { id } = useParams();
  const { beginDate, endDate, ...window } = useAutomationStatsWindow();

  const { data, loading, error, refetch } = useQuery<{
    automationStats: TAutomationStats;
  }>(AUTOMATION_STATS, {
    variables: {
      automationId: id,
      beginDate,
      endDate,
    },
    skip: skip || !id,
  });

  return {
    stats: data?.automationStats,
    loading,
    error,
    refetch,
    window: { beginDate, endDate, ...window },
  };
};
