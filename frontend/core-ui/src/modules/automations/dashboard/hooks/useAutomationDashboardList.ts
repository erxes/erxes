import { AUTOMATIONS_DASHBOARD_LIST } from '@/automations/dashboard/graphql/automationDashboardQueries';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

type TAutomationDashboardListItem = Pick<
  IAutomation,
  '_id' | 'name' | 'status' | 'updatedAt'
>;

/**
 * The named automations in the order given; archived or deleted ones drop
 * out, so the caller can tell how many are still there.
 */
export const useAutomationDashboardList = (ids: string[]) => {
  const { data, loading, error, refetch } = useQuery<{
    automationsMain: { list: TAutomationDashboardListItem[] };
  }>(AUTOMATIONS_DASHBOARD_LIST, {
    variables: { ids, limit: ids.length },
    skip: !ids.length,
  });

  const automations = useMemo(() => {
    const byId = new Map(
      (data?.automationsMain.list || []).map((automation) => [
        automation._id,
        automation,
      ]),
    );

    return ids.flatMap((id) => {
      const automation = byId.get(id);
      return automation ? [automation] : [];
    });
  }, [data, ids]);

  return { automations, loading, error, refetch };
};
