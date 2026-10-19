import { AutomationStatsLatency } from '@/automations/components/builder/stats/components/AutomationStatsLatency';
import { AutomationStatsTraces } from '@/automations/components/builder/stats/components/AutomationStatsTraces';
import {
  ACTIVITY_RANGE_KEYS,
  TAutomationActivityRange,
  TAutomationStatsActivity,
} from '@/automations/components/builder/stats/hooks/useAutomationStatsActivity';
import { useAutomationStatsNodeOptions } from '@/automations/components/builder/stats/hooks/useAutomationStatsNodeOptions';
import { formatStatsDuration } from '@/automations/components/builder/stats/utils/automationStatsFormat';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Select, Skeleton, ToggleGroup } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const ALL_ACTIONS = '__all__';

const ActivityCard = ({
  title,
  actions,
  children,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-3 rounded-lg border bg-background p-4">
    <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
      {title}
      <div className="flex items-center gap-2">{actions}</div>
    </div>
    {children}
  </div>
);

const ActivityBody = ({
  loading,
  error,
  children,
}: Pick<TAutomationStatsActivity, 'loading' | 'error'> & {
  children: ReactNode;
}) => {
  if (loading) {
    return <Skeleton className="h-56 w-full" />;
  }

  if (error) {
    return (
      <div className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
        <IconAlertTriangle className="size-4 text-destructive" />
        {error.message}
      </div>
    );
  }

  return <>{children}</>;
};

export const AutomationStatsActivity = ({
  range,
  setRange,
  actionId,
  setActionId,
  traces,
  latency,
  p50Ms,
  p95Ms,
  totals,
  formatBucket,
  loading,
  error,
}: TAutomationStatsActivity) => {
  const { t } = useTranslation('automations');
  const nodeOptions = useAutomationStatsNodeOptions();

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ActivityCard
        title={
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t('stats-traces')}</span>
            {!loading && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {t('stats-runs')}: {totals.runs}
              </span>
            )}
            {!loading && totals.runs > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                <span className="h-0.5 w-3 rounded-full bg-destructive" />
                {t('stats-error-rate')}: {totals.errorRate}%
              </span>
            )}
          </div>
        }
        actions={
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={range}
            onValueChange={(value) =>
              value && setRange(value as TAutomationActivityRange)
            }
          >
            {ACTIVITY_RANGE_KEYS.map((key) => (
              <ToggleGroup.Item key={key} value={key} className="px-2.5">
                {key}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        }
      >
        <ActivityBody loading={loading} error={error}>
          <AutomationStatsTraces traces={traces} formatBucket={formatBucket} />
        </ActivityBody>
      </ActivityCard>

      <ActivityCard
        title={
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t('stats-latency')}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                P50 {formatStatsDuration(p50Ms)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground" />
                P95 {formatStatsDuration(p95Ms)}
              </span>
            </div>
          </div>
        }
        actions={
          <Select
            value={actionId ?? ALL_ACTIONS}
            onValueChange={(value) =>
              setActionId(value === ALL_ACTIONS ? undefined : value)
            }
          >
            <Select.Trigger className="h-8 w-48">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={ALL_ACTIONS}>
                {t('stats-all-actions')}
              </Select.Item>
              {nodeOptions.map(({ value, label }) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        }
      >
        <ActivityBody loading={loading} error={error}>
          <AutomationStatsLatency
            latency={latency}
            formatBucket={formatBucket}
          />
        </ActivityBody>
      </ActivityCard>
    </div>
  );
};
