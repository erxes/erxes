import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import { StatusBadgeValue, TAutomationStats } from '@/automations/types';

export const statusVariantOf = (status: string): StatusBadgeValue =>
  STATUSES_BADGE_VARIABLES[status as keyof typeof STATUSES_BADGE_VARIABLES] ??
  'secondary';

const errorRateOf = ({ total, byStatus }: TAutomationStats) => {
  const errorTotal = byStatus.find(({ key }) => key === 'error')?.count ?? 0;

  return total ? Math.round((errorTotal / total) * 100) : 0;
};

/** The headline numbers: runs, the share that failed, and the breakdowns. */
export const useAutomationStatsOverview = (stats: TAutomationStats) => ({
  total: stats.total,
  byStatus: stats.byStatus,
  byErrorCode: stats.byErrorCode,
  errorRate: errorRateOf(stats),
});
