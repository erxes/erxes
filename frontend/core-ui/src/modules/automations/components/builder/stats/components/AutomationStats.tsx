import { AutomationStatsChart } from '@/automations/components/builder/stats/components/AutomationStatsChart';
import { AutomationStatsErrorMessages } from '@/automations/components/builder/stats/components/AutomationStatsErrorMessages';
import { AutomationStatsFilter } from '@/automations/components/builder/stats/components/AutomationStatsFilter';
import { AutomationStatsNodes } from '@/automations/components/builder/stats/components/AutomationStatsNodes';
import { AutomationStatsOverview } from '@/automations/components/builder/stats/components/AutomationStatsOverview';
import { AutomationStatsWindowNav } from '@/automations/components/builder/stats/components/AutomationStatsWindowNav';
import { useAutomationStats } from '@/automations/components/builder/stats/hooks/useAutomationStats';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button, PageSubHeader, Skeleton } from 'erxes-ui';

const AutomationStatsSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} className="h-24 w-full rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-72 w-full rounded-lg" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

export const AutomationStats = () => {
  const { stats, loading, error, refetch, window } = useAutomationStats();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageSubHeader>
        <AutomationStatsFilter />
        <div className="ml-auto flex items-center gap-1">
          <AutomationStatsWindowNav {...window} />
          <Button variant="ghost" disabled={loading} onClick={() => refetch()}>
            <IconRefresh />
          </Button>
        </div>
      </PageSubHeader>

      <div className="flex-1 min-h-0 overflow-y-auto bg-sidebar p-4">
        {loading && <AutomationStatsSkeleton />}

        {!loading && error && (
          <div className="flex items-center gap-2 rounded-lg border bg-background p-4 text-sm">
            <IconAlertTriangle className="size-4 text-destructive" />
            <span className="flex-auto text-muted-foreground">
              {error.message}
            </span>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="flex flex-col gap-4">
            <AutomationStatsOverview stats={stats} />
            <AutomationStatsChart
              timeSeries={stats.timeSeries}
              beginDate={window.beginDate}
              endDate={window.endDate}
            />
            <AutomationStatsErrorMessages errorMessages={stats.errorMessages} />
            <AutomationStatsNodes nodes={stats.nodes} />
          </div>
        )}
      </div>
    </div>
  );
};
