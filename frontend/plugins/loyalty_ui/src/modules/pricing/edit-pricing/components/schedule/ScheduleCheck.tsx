import { Input, Label, Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IPricingActiveWindow, PricingScheduleMoment } from '@/pricing/types';
import { useScheduleCheck } from '@/pricing/hooks/useScheduleCheck';
import { useScheduleWindowLabel } from '@/pricing/hooks/useScheduleWindowLabel';

interface ScheduleCheckProps {
  windows: IPricingActiveWindow[];
  closedDates: string[];
  scheduleMoment: PricingScheduleMoment;
}

export const ScheduleCheck = ({
  windows,
  closedDates,
  scheduleMoment,
}: ScheduleCheckProps) => {
  const { t } = useTranslation('loyalty');
  const label = useScheduleWindowLabel();
  const {
    orderCreatedAt,
    checkoutAt,
    setOrderCreatedAt,
    setCheckoutAt,
    loading,
    error,
    result,
  } = useScheduleCheck({ windows, closedDates, scheduleMoment });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t('schedule-check')}</p>
      <div className="grid gap-3 sm:grid-cols-2 sm:max-w-lg">
        <div className="space-y-1">
          <Label htmlFor="schedule-check-order">
            {t('schedule-check-order-created')}
          </Label>
          <Input
            id="schedule-check-order"
            type="datetime-local"
            value={orderCreatedAt}
            onChange={(event) => setOrderCreatedAt(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="schedule-check-checkout">
            {t('schedule-check-checkout')}
          </Label>
          <Input
            id="schedule-check-checkout"
            type="datetime-local"
            value={checkoutAt}
            onChange={(event) => setCheckoutAt(event.target.value)}
          />
        </div>
      </div>

      {loading && <Spinner size="sm" />}

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {result && !loading && (
        <div
          className={cn(
            'px-3 py-2 space-y-1 text-sm rounded-md',
            result.active ? 'bg-success/10' : 'bg-accent',
          )}
        >
          <p className={cn('font-medium', result.active && 'text-success')}>
            {result.active ? t('schedule-active') : t('schedule-inactive')}
          </p>
          <p className="text-muted-foreground">
            {result.matchedMoment && result.window
              ? t(`schedule-matched-${result.matchedMoment}`, {
                  window: label.full(result.window),
                })
              : t(`schedule-unmatched-${scheduleMoment}`)}
            <span className="ml-1">({result.timeZone})</span>
          </p>
        </div>
      )}
    </div>
  );
};
