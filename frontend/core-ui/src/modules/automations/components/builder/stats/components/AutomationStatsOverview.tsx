import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import {
  StatusBadgeValue,
  TAutomationStats,
  TAutomationStatsCount,
} from '@/automations/types';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const getStatusVariant = (status: string): StatusBadgeValue =>
  STATUSES_BADGE_VARIABLES[status as keyof typeof STATUSES_BADGE_VARIABLES] ??
  'secondary';

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

const formatErrorCode = (code: string) =>
  code.toLowerCase().split('_').join(' ');

export const AutomationStatsOverview = ({
  stats,
}: {
  stats: TAutomationStats;
}) => {
  const { t } = useTranslation('automations');
  const { total, byStatus, byErrorCode } = stats;

  const errorTotal = byStatus.find(({ key }) => key === 'error')?.count ?? 0;
  const errorRate = total ? Math.round((errorTotal / total) * 100) : 0;

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
            <Badge key={key} variant={getStatusVariant(key)}>
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
