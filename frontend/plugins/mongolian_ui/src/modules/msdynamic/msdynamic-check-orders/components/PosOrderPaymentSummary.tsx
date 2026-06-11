import { IPaidAmount, IPosOrderDetail } from '../types/msDynamicCheckOrder';
import { DetailRow, DetailSection, formatAmount } from './PosOrderDetailLayout';

/** Payment summary bottom deer gargana. */
export const PosOrderPaymentSummary = ({
  orders,
  paidAmounts,
}: {
  orders: IPosOrderDetail;
  paidAmounts: IPaidAmount[];
}) => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
    <DetailSection title="Totals">
      <div className="rounded-md border border-border/70 px-4">
        <DetailRow
          label="Total Amount"
          value={formatAmount(orders.totalAmount)}
          strong
        />
      </div>
    </DetailSection>

    <DetailSection title="Payment Breakdown">
      <div className="grid grid-cols-1 gap-x-6 rounded-md border border-border/70 px-4 md:grid-cols-2">
        {orders.cashAmount !== undefined && (
          <DetailRow
            label="Cash Amount"
            value={formatAmount(orders.cashAmount)}
            strong
          />
        )}
        {orders.mobileAmount !== undefined && (
          <DetailRow
            label="Mobile Amount"
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
