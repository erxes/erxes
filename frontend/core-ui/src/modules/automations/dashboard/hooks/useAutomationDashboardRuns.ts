import { AUTOMATION_DASHBOARD_RUNS_LIMIT } from '@/automations/dashboard/automationDashboardConfig';
import { AUTOMATION_DASHBOARD_RUNS } from '@/automations/dashboard/graphql/automationDashboardQueries';
import { useQuery } from '@apollo/client';
import { IAutomationHistory } from 'ui-modules';

type TAutomationDashboardRun = IAutomationHistory & {
  errorCode?: string;
  failedActionType?: string;
};

/** The automation's latest runs, newest first; fresh on every visit. */
export const useAutomationDashboardRuns = (automationId?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    automationHistories: { list: TAutomationDashboardRun[] };
  }>(AUTOMATION_DASHBOARD_RUNS, {
    variables: { automationId, limit: AUTOMATION_DASHBOARD_RUNS_LIMIT },
    skip: !automationId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    runs: data?.automationHistories.list || [],
    loading,
    error,
    refetch,
  };
};
