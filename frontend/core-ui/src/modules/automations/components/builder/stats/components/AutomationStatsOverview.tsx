import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import {
  StatusBadgeValue,
  TAutomationStats,
  TAutomationStatsCount,
} from '@/automations/types';
import { Badge } from 'erxes-ui';

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
  const { total, byStatus, byErrorCode } = stats;

  const errorTotal =
    byStatus.find(({ key }) => key === 'error')?.count ?? 0;
  const errorRate = total ? Math.round((errorTotal / total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatTile label="Runs">
        <span className="text-2xl font-semibold leading-none">{total}</span>
        {!!total && (
          <span className="text-xs text-muted-foreground">
            {errorRate}% failed
          </span>
        )}
      </StatTile>

      <StatTile label="By status">
        {byStatus.length ? (
          byStatus.map(({ key, count }: TAutomationStatsCount) => (
            <Badge key={key} variant={getStatusVariant(key)}>
              {key} {count}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No runs</span>
        )}
      </StatTile>

      <StatTile label="Failure reasons">
        {byErrorCode.length ? (
          byErrorCode.map(({ key, count }: TAutomationStatsCount) => (
            <Badge key={key} variant="destructive">
              {formatErrorCode(key)} {count}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No failures</span>
        )}
      </StatTile>
    </div>
  );
};
