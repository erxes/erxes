import { useTranslation } from 'react-i18next';
import { DashboardWidgetCard, TDashboardWidgetConfig } from 'ui-modules';
import { SafeRelativeDate } from '@/loyalties/components/SafeRelativeDate';
import { VoucherOwner } from '@/loyalties/vouchers/components/VoucherOwner';
import { VoucherStatusBadge } from '@/loyalties/vouchers/components/VoucherStatusBadge';
import { TVoucherStatus } from '@/loyalties/vouchers/types/voucher';
import { LoyaltyDashboardBody } from '../components/LoyaltyDashboardBody';
import { LoyaltyDashboardViewAll } from '../components/LoyaltyDashboardViewAll';
import {
  RECENT_VOUCHERS_DEFAULTS,
  recentVouchersConfigSchema,
} from '../dashboardWidgetConfig';
import { useLoyaltyDashboardConfig } from '../hooks/useLoyaltyDashboardConfig';
import { useRecentVouchers } from '../hooks/useLoyaltyDashboardData';

const VOUCHER_STATUSES: readonly string[] = [
  'new',
  'onhold',
  'used',
  'cancelled',
  'expired',
] satisfies TVoucherStatus[];

const isVoucherStatus = (status?: string): status is TVoucherStatus =>
  !!status && VOUCHER_STATUSES.includes(status);

/** The latest vouchers handed out, or the latest ones spent. */
export const RecentVouchersDashboardWidget = ({
  config,
}: {
  config?: TDashboardWidgetConfig | null;
}) => {
  const { t } = useTranslation('loyalty');
  const { kind } = useLoyaltyDashboardConfig(
    recentVouchersConfigSchema,
    config,
    RECENT_VOUCHERS_DEFAULTS,
  );
  const { vouchers, loading, error, refetch } = useRecentVouchers(kind);
  const redeemed = kind === 'redeemed';

  return (
    <DashboardWidgetCard
      title={
        redeemed
          ? t('dashboard.recent-vouchers-redeemed')
          : t('dashboard.recent-vouchers-issued')
      }
      action={<LoyaltyDashboardViewAll to="/loyalty/vouchers" />}
    >
      <LoyaltyDashboardBody
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!vouchers.length}
        emptyLabel={
          redeemed
            ? t('dashboard.no-vouchers-redeemed')
            : t('dashboard.no-vouchers-issued')
        }
      >
        <ul className="flex flex-col gap-0.5">
          {vouchers.map((voucher) => (
            <li
              key={voucher._id}
              className="flex h-10 min-w-0 items-center gap-3 rounded-md px-2 text-sm hover:bg-accent/60"
            >
              <span className="min-w-0 flex-1 truncate">
                <VoucherOwner
                  ownerId={voucher.ownerId}
                  ownerType={voucher.ownerType}
                />
              </span>
              {isVoucherStatus(voucher.status) && (
                <VoucherStatusBadge status={voucher.status} />
              )}
              <span className="shrink-0 text-xs text-muted-foreground">
                <SafeRelativeDate
                  value={redeemed ? voucher.usedAt : voucher.createdAt}
                />
              </span>
            </li>
          ))}
        </ul>
      </LoyaltyDashboardBody>
    </DashboardWidgetCard>
  );
};
