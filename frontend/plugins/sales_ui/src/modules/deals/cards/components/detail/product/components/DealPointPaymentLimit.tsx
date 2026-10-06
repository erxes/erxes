import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { PaymentConfigItem } from '@/payments';
import { useDealPointLimit } from '../hooks/payment/useDealPointLimit';

/**
 * Under a payment type that pays with points: who pays, how much they may,
 * or why they cannot. The limit goes back up so the row can enforce it.
 */
export const DealPointPaymentLimit = ({
  paymentType,
  customerId,
  dealId,
  totalAmount,
  onLimit,
}: {
  paymentType: PaymentConfigItem;
  customerId?: string;
  dealId: string;
  totalAmount: number;
  onLimit: (type: string, maxAmount: number, unavailable: boolean) => void;
}) => {
  const { t } = useTranslation('sales');
  const { limit, loading, error } = useDealPointLimit({
    campaignId: paymentType.scoreCampaignId,
    customerId,
    dealId,
    totalAmount,
  });

  const unavailable = !customerId || loading || !!error || !!limit?.blocked;
  const maxAmount = limit?.maxAmount ?? 0;

  useEffect(() => {
    onLimit(paymentType.type, maxAmount, unavailable);
  }, [maxAmount, onLimit, paymentType.type, unavailable]);

  if (!customerId) {
    return (
      <span className="text-xs text-muted-foreground">
        {t('points-need-customer')}
      </span>
    );
  }

  if (loading && !limit) {
    return (
      <span className="text-xs text-muted-foreground">{t('loading')}…</span>
    );
  }

  if (error) {
    return <span className="text-xs text-destructive">{error.message}</span>;
  }

  if (!limit) {
    return null;
  }

  if (limit.blocked) {
    return (
      <span className="text-xs text-destructive">
        {t(`points-blocked-${limit.blocked}`)}
      </span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      {t('points-available', {
        points: limit.balance.toLocaleString(),
        amount: limit.maxAmount.toLocaleString(),
      })}
    </span>
  );
};
