import { useTranslation } from 'react-i18next';
import { IPaidAmount, IPosOrderDetail } from '../types/msDynamicCheckOrder';
import { DetailRow, DetailSection, formatAmount } from './PosOrderDetailLayout';

/** Payment summary bottom deer gargana. */
export const PosOrderPaymentSummary = ({
  orders,
  paidAmounts,
}: {
  orders: IPosOrderDetail;
  paidAmounts: IPaidAmount[];
}) => {
  const { t } = useTranslation('mongolian');
  return (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
    <DetailSection title={t('totals')}>
      <div className="rounded-md border border-border/70 px-4">
        <DetailRow
          label={t('total-amount')}
          value={formatAmount(orders.totalAmount)}
          strong
        />
      </div>
    </DetailSection>

    <DetailSection title={t('payment-breakdown')}>
      <div className="grid grid-cols-1 gap-x-6 rounded-md border border-border/70 px-4 md:grid-cols-2">
        {orders.cashAmount !== undefined && (
          <DetailRow
            label={t('cash-amount')}
            value={formatAmount(orders.cashAmount)}
            strong
          />
        )}
        {orders.mobileAmount !== undefined && (
          <DetailRow
            label={t('mobile-amount')}
            value={formatAmount(orders.mobileAmount)}
          />
        )}
        {paidAmounts.map((paid: IPaidAmount) => (
          <DetailRow
            key={paid._id}
            label={paid.type}
            value={formatAmount(paid.amount)}
          />
        ))}
      </div>
    </DetailSection>
  </div>
  );
};
