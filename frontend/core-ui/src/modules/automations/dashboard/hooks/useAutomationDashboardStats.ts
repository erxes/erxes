import { useAutomationStats } from '@/automations/components/builder/stats/hooks/useAutomationStats';
import { AUTOMATION_DASHBOARD_DETAIL } from '@/automations/dashboard/graphql/automationDashboardQueries';
import { useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { useMemo } from 'react';

type TAutomationDashboardNode = { id: string; type: string; label?: string };

type TAutomationDashboardDetail = {
  _id: string;
  name: string;
  actions?: TAutomationDashboardNode[];
  workflows?: { id: string; actions?: TAutomationDashboardNode[] }[];
};

/** The automation's name and nodes, which stats rows are labelled with. */
export const useAutomationDashboardDetail = (automationId?: string) => {
  const { data, loading, error } = useQuery<{
    automationDetail: TAutomationDashboardDetail | null;
  }>(AUTOMATION_DASHBOARD_DETAIL, {
    variables: { id: automationId },
    skip: !automationId,
  });

  return { detail: data?.automationDetail, loading, error };
};

/** Stats for the last `days` days, ending today. */
export const useAutomationDashboardStats = (
  automationId: string | undefined,
  days: number,
) => {
  // Fixed per mount and period, so the query doesn't chase the clock
  const { beginDate, endDate } = useMemo(() => {
    const end = dayjs().endOf('day');

    return {
      beginDate: end
        .subtract(days - 1, 'day')
        .startOf('day')
        .toDate(),
      endDate: end.toDate(),
    };
  }, [days]);

  const stats = useAutomationStats({ automationId, beginDate, endDate });

  return { ...stats, beginDate, endDate };
};
