import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DashboardWidgetCard } from 'ui-modules';
import { SafeRelativeDate } from '@/loyalties/components/SafeRelativeDate';
import { couponStatusVariant } from '@/loyalties/coupons/components/CouponColumns';
import { VoucherOwner } from '@/loyalties/vouchers/components/VoucherOwner';
import { LoyaltyDashboardBody } from '../components/LoyaltyDashboardBody';
import { LoyaltyDashboardViewAll } from '../components/LoyaltyDashboardViewAll';
import { useRecentCoupons } from '../hooks/useLoyaltyDashboardData';

/** The latest coupon codes issued, with how often each was used. */
export const RecentCouponsDashboardWidget = () => {
  const { t } = useTranslation('loyalty');
  const { coupons, loading, error, refetch } = useRecentCoupons();

  return (
    <DashboardWidgetCard
      title={t('dashboard.recent-coupons')}
      action={<LoyaltyDashboardViewAll to="/loyalty/coupons" />}
    >
      <LoyaltyDashboardBody
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!coupons.length}
        emptyLabel={t('dashboard.no-coupons')}
      >
        <ul className="flex flex-col gap-0.5">
          {coupons.map((coupon) => (
            <li
              key={coupon._id}
              className="flex h-10 min-w-0 items-center gap-3 rounded-md px-2 text-sm hover:bg-accent/60"
            >
              <span className="shrink-0 font-mono text-xs font-semibold">
                {coupon.code || '—'}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {coupon.ownerId ? (
                  <VoucherOwner
                    ownerId={coupon.ownerId}
                    ownerType={coupon.ownerType}
                  />
                ) : (
                  coupon.campaign?.title
                )}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {t('dashboard.coupon-usage', {
                  used: coupon.usageCount ?? 0,
                  limit: coupon.usageLimit ?? '∞',
                })}
              </span>
              {coupon.status && (
                <Badge
                  variant={couponStatusVariant(coupon.status)}
                  className="capitalize"
                >
                  {coupon.status.replace('_', ' ')}
                </Badge>
              )}
              <span className="shrink-0 text-xs text-muted-foreground">
                <SafeRelativeDate value={coupon.createdAt} />
              </span>
            </li>
          ))}
        </ul>
      </LoyaltyDashboardBody>
    </DashboardWidgetCard>
  );
};
