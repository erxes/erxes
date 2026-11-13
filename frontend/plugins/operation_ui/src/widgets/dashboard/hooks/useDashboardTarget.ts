import { useGetActiveCycles } from '@/cycle/hooks/useGetActiveCycles';
import { useGetCycle } from '@/cycle/hooks/useGetCycle';
import { useGetProject } from '@/project/hooks/useGetProject';
import { useMemo } from 'react';
import type { TDashboardWidgetConfig } from 'ui-modules';
import {
  cycleDashboardConfigSchema,
  projectDashboardConfigSchema,
} from '~/widgets/dashboard/operationDashboardConfig';

/** The project a project tile is set to, with its name for the title. */
export const useDashboardProject = (config?: TDashboardWidgetConfig | null) => {
  const projectId = useMemo(() => {
    const parsed = projectDashboardConfigSchema.safeParse(config);
    return parsed.success ? parsed.data.projectId : undefined;
  }, [config]);

  const { project, loading, error, refetch } = useGetProject(projectId);

  return {
    projectId,
    project,
    loading,
    error,
    refetch,
    href: projectId ? `/operation/projects/${projectId}/overview` : null,
  };
};

/**
 * The cycle a cycle tile shows: the pinned one, or the team's active cycle.
 * A completed cycle's numbers come from its stored `statistics`, as on the
 * cycle page.
 */
export const useDashboardCycle = (config?: TDashboardWidgetConfig | null) => {
  const settings = useMemo(() => {
    const parsed = cycleDashboardConfigSchema.safeParse(config);
    return parsed.success ? parsed.data : undefined;
  }, [config]);

  const followsCurrent = settings?.cycleMode === 'current';
  const active = useGetActiveCycles(followsCurrent ? settings?.teamId : null);
  const cycleId = followsCurrent
    ? active.activeCycles.find((cycle) => cycle.isActive)?._id
    : settings?.cycleId;

  const { cycleDetail, loading, error, refetch } = useGetCycle(cycleId);

  return {
    configured: !!settings,
    followsCurrent,
    cycleId,
    cycle: cycleDetail,
    isCompleted: !!cycleDetail?.isCompleted,
    statistics: cycleDetail?.statistics ?? undefined,
    loading: active.loading || loading,
    error: active.error || error,
    refetch: () => {
      if (followsCurrent) {
        void active.refetch();
      }
      if (cycleId) {
        void refetch();
      }
    },
    href:
      settings && cycleId
        ? `/operation/team/${settings.teamId}/cycles/${cycleId}`
        : null,
  };
};
