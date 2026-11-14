import {
  statusVariantOf,
  useAutomationStatsOverview,
} from '@/automations/components/builder/stats/hooks/useAutomationStatsOverview';
import { formatErrorCode } from '@/automations/components/builder/stats/utils/automationStatsFormat';
import { TAutomationStats, TAutomationStatsCount } from '@/automations/types';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const StatTile = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 rounded-lg border bg-background p-4">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <div className="flex flex-wrap items-center gap-1.5">{children}</div>
  </div>
);

export const AutomationStatsOverview = ({
  stats,
}: {
  stats: TAutomationStats;
}) => {
  const { t } = useTranslation('automations');
  const { total, byStatus, byErrorCode, errorRate } =
    useAutomationStatsOverview(stats);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatTile label={t('stats-runs')}>
        <span className="text-2xl font-semibold leading-none">{total}</span>
        {!!total && (
          <span className="text-xs text-muted-foreground">
            {t('stats-failed-rate', { rate: errorRate })}
          </span>
        )}
      </StatTile>

      <StatTile label={t('stats-by-status')}>
        {byStatus.length ? (
          byStatus.map(({ key, count }: TAutomationStatsCount) => (
            <Badge key={key} variant={statusVariantOf(key)}>
              {key} {count}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            {t('stats-no-runs')}
          </span>
        )}
      </StatTile>

      <StatTile label={t('stats-failure-reasons')}>
        {byErrorCode.length ? (
          byErrorCode.map(({ key, count }: TAutomationStatsCount) => (
            <Badge key={key} variant="destructive">
              {formatErrorCode(key)} {count}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            {t('stats-no-failures')}
          </span>
        )}
      </StatTile>
    </div>
  );
};
