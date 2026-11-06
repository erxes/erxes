import { DASHBOARD_DEFAULT_LAYOUT } from '@/home/dashboard/constants/dashboardGrid';
import {
  DASHBOARD_LAYOUT_RESET,
  DASHBOARD_LAYOUT_SAVE,
} from '@/home/dashboard/graphql/dashboardLayoutMutations';
import { DASHBOARD_LAYOUT_BY_CURRENT_USER } from '@/home/dashboard/graphql/dashboardLayoutQueries';
import { TDashboardItem } from '@/home/dashboard/types/dashboardTypes';
import { useMutation, useQuery } from '@apollo/client';

type TDashboardLayoutResponse = {
  dashboardLayoutByCurrentUser: { _id: string; items: TDashboardItem[] } | null;
};

// Only the fields the input type accepts; Apollo adds __typename on reads.
const toInput = ({ id, type, x, y, w, h, config }: TDashboardItem) => ({
  id,
  type,
  x,
  y,
  w,
  h,
  config: config ?? null,
});

/** The user's saved tiles, or the default layout until they save one. */
export const useDashboardLayout = () => {
  const { data, loading, error } = useQuery<TDashboardLayoutResponse>(
    DASHBOARD_LAYOUT_BY_CURRENT_USER,
  );

  const [saveMutation, { loading: saving }] = useMutation<{
    dashboardLayoutSave: TDashboardLayoutResponse['dashboardLayoutByCurrentUser'];
  }>(DASHBOARD_LAYOUT_SAVE, {
    update: (cache, { data: result }) => {
      cache.writeQuery<TDashboardLayoutResponse>({
        query: DASHBOARD_LAYOUT_BY_CURRENT_USER,
        data: {
          dashboardLayoutByCurrentUser: result?.dashboardLayoutSave ?? null,
        },
      });
    },
  });

  const [resetMutation, { loading: resetting }] = useMutation(
    DASHBOARD_LAYOUT_RESET,
    {
      update: (cache) => {
        cache.writeQuery<TDashboardLayoutResponse>({
          query: DASHBOARD_LAYOUT_BY_CURRENT_USER,
          data: { dashboardLayoutByCurrentUser: null },
        });
      },
    },
  );

  const stored = data?.dashboardLayoutByCurrentUser;

  return {
    items: stored ? stored.items : DASHBOARD_DEFAULT_LAYOUT,
    isCustomized: !!stored,
    loading,
    error,
    saving: saving || resetting,
    save: (items: TDashboardItem[]) =>
      saveMutation({ variables: { items: items.map(toInput) } }),
    reset: () => resetMutation(),
  };
};
