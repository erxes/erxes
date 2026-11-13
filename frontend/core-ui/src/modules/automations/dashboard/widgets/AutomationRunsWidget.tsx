import { DashboardWidgetCard } from 'ui-modules';
import { AutomationHistoryResultName } from '@/automations/components/builder/history/components/AutomationHistoryResultName';
import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import { automationRunsConfigSchema } from '@/automations/dashboard/automationDashboardConfig';
import { AutomationDashboardBody } from '@/automations/dashboard/components/AutomationDashboardStates';
import { useAutomationDashboardList } from '@/automations/dashboard/hooks/useAutomationDashboardList';
import { useAutomationDashboardRuns } from '@/automations/dashboard/hooks/useAutomationDashboardRuns';
import { useAutomationRunLabels } from '@/automations/hooks/useAutomationRunLabels';
import { useOpenAutomationRun } from '@/automations/hooks/useOpenAutomationRun';
import { AutomationBuilderTabsType } from '@/automations/types';
import { TDashboardWidgetProps } from '@/home/dashboard/types/dashboardTypes';
import { Badge, Button, RelativeDateDisplay } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/** One automation's five latest runs; a row opens it in History. */
export const AutomationRunsWidget = ({ config }: TDashboardWidgetProps) => {
  const { t } = useTranslation('automations');
  const automationId = useMemo(() => {
    const parsed = automationRunsConfigSchema.safeParse(config);
    return parsed.success ? parsed.data.automationId : undefined;
  }, [config]);
  const ids = useMemo(
    () => (automationId ? [automationId] : []),
    [automationId],
  );

  const { automations } = useAutomationDashboardList(ids);
  const { runs, loading, error, refetch } =
    useAutomationDashboardRuns(automationId);
  const { statusLabel, actionLabel } = useAutomationRunLabels();
  const openRun = useOpenAutomationRun();

  const name = automations[0]?.name;

  return (
    <DashboardWidgetCard
      title={
        name
          ? t('dashboard-runs-title-of', { name })
          : t('dashboard-runs-title')
      }
      action={
        automationId && (
          <Button variant="ghost" size="sm" asChild>
            <Link
              to={`/automations/edit/${automationId}?activeTab=${AutomationBuilderTabsType.History}`}
            >
              {t('dashboard-view-all')}
            </Link>
          </Button>
        )
      }
    >
      <AutomationDashboardBody
        loading={loading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!runs.length}
        emptyLabel={
          automationId ? t('dashboard-no-runs') : t('dashboard-not-configured')
        }
      >
        <ul className="flex flex-col gap-0.5">
          {runs.map((run) => (
            <li
              key={run._id}
              className="flex h-10 min-w-0 items-center gap-2 rounded-md pl-2 text-sm hover:bg-accent/60"
            >
              {/* The target name links to the record, the rest to the run */}
              <span className="min-w-0 flex-1 truncate">
                <AutomationHistoryResultName executionDetail={run} />
              </span>
              <button
                type="button"
                aria-label={t('dashboard-open-run')}
                className="flex h-full shrink-0 items-center gap-3 px-2"
                onClick={() => openRun(run.automationId, run._id)}
              >
                {run.status === 'error' && run.failedActionType && (
                  <span className="hidden max-w-40 truncate text-xs text-muted-foreground lg:inline">
                    {actionLabel(run.failedActionType)}
                  </span>
                )}
                <Badge variant={STATUSES_BADGE_VARIABLES[run.status]}>
                  {statusLabel(run.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  <RelativeDateDisplay.Value value={String(run.createdAt)} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </AutomationDashboardBody>
    </DashboardWidgetCard>
  );
};
