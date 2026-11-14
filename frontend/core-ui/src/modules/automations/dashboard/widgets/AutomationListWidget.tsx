import { DashboardWidgetCard } from 'ui-modules';
import { AutomationRecentRunsStrip } from '@/automations/components/list/AutomationRecentRunsStrip';
import { AutomationStatusBadge } from '@/automations/components/list/AutomationStatusToggle';
import { automationListConfigSchema } from '@/automations/dashboard/automationDashboardConfig';
import { AutomationDashboardBody } from '@/automations/dashboard/components/AutomationDashboardStates';
import { useAutomationDashboardList } from '@/automations/dashboard/hooks/useAutomationDashboardList';
import { useAutomationExecutionCounts } from '@/automations/hooks/useAutomationExecutionCounts';
import { useAutomationRecentRuns } from '@/automations/hooks/useAutomationRecentRuns';
import {
  automationExecutionCountAtomFamily,
  automationExecutionCountsLoadingState,
} from '@/automations/states/automationExecutionCountsState';
import { TDashboardWidgetProps } from '@/home/dashboard/types/dashboardTypes';
import { Button, RelativeDateDisplay, Skeleton, Table } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const RunCount = ({ id }: { id: string }) => {
  const count = useAtomValue(automationExecutionCountAtomFamily(id));
  const loading = useAtomValue(automationExecutionCountsLoadingState);

  if (count !== undefined) {
    return <>{count}</>;
  }

  return loading ? (
    <Skeleton className="ml-auto h-3 w-8" />
  ) : (
    <span className="text-muted-foreground">—</span>
  );
};

/** Up to five chosen automations with run counts and their last runs. */
export const AutomationListWidget = ({ config }: TDashboardWidgetProps) => {
  const { t } = useTranslation('automations');
  const ids = useMemo(() => {
    const parsed = automationListConfigSchema.safeParse(config);
    return parsed.success ? parsed.data.automationIds : [];
  }, [config]);

  const { automations, loading, error, refetch } =
    useAutomationDashboardList(ids);
  useAutomationExecutionCounts(ids);
  useAutomationRecentRuns(ids);

  return (
    <DashboardWidgetCard
      title={t('dashboard-automations-title')}
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/automations">{t('dashboard-view-all')}</Link>
        </Button>
      }
    >
      <AutomationDashboardBody
        loading={loading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!automations.length}
        emptyLabel={
          ids.length
            ? t('dashboard-automations-gone')
            : t('dashboard-not-configured')
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head className="px-2">{t('name')}</Table.Head>
                <Table.Head className="px-2">{t('status')}</Table.Head>
                <Table.Head className="px-2 text-right">{t('runs')}</Table.Head>
                <Table.Head className="px-2">
                  {t('history-last-runs')}
                </Table.Head>
                <Table.Head className="px-2">{t('last-updated-at')}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {automations.map(({ _id, name, status, updatedAt }) => (
                <Table.Row key={_id}>
                  <Table.Cell className="max-w-64 px-2 font-medium">
                    <Link
                      to={`/automations/edit/${_id}`}
                      title={name}
                      className="block truncate hover:underline"
                    >
                      {name}
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="px-2">
                    <AutomationStatusBadge status={status} />
                  </Table.Cell>
                  <Table.Cell className="px-2 text-right tabular-nums">
                    <RunCount id={_id} />
                  </Table.Cell>
                  <Table.Cell className="px-2">
                    <AutomationRecentRunsStrip automationId={_id} />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap px-2 text-muted-foreground">
                    {updatedAt && (
                      <RelativeDateDisplay.Value value={String(updatedAt)} />
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </AutomationDashboardBody>
    </DashboardWidgetCard>
  );
};
