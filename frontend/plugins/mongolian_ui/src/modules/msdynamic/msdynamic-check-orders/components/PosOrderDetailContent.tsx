import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { IOrderCustomer, IPosOrderDetail } from '../types/msDynamicCheckOrder';
import {
  DetailSection,
  formatAmount,
  SummaryMetric,
} from './PosOrderDetailLayout';
import { PosOrderExtraInfo } from './PosOrderExtraInfo';
import { PosOrderItemsTable } from './PosOrderItemsTable';
import { PosOrderPaymentSummary } from './PosOrderPaymentSummary';

type Props = {
  orders: IPosOrderDetail;
};

/** Customer neriig haruulah text bolgono. */
const generateCustomerLabel = (customer?: IOrderCustomer) => {
  if (!customer) return '';

  const { firstName, lastName, primaryPhone, primaryEmail } = customer;

  const parts: string[] = [];

  if (firstName) parts.push(firstName.toUpperCase());
  if (lastName) parts.push(lastName);

  let value = parts.join(' ');

  if (primaryPhone) value += ` (${primaryPhone})`;
  if (primaryEmail) value += ` /${primaryEmail}/`;

  return value;
};

/** Order detail body heseg gargana. */
export const PosOrderDetailContent = ({ orders }: Props) => {
  const { t } = useTranslation('mongolian');
  const items = orders.items || [];
  const paidAmounts = orders.paidAmounts || [];
  const responses = orders.putResponses || [];
  const paidDate = orders.paidDate || orders.createdAt;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="rounded-md border border-border/70 bg-muted/10 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <SummaryMetric label={t('bill-number')} value={orders.number} />
          <SummaryMetric
            label={t('total-amount')}
            value={formatAmount(orders.totalAmount)}
            align="right"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border/70 pt-4 sm:grid-cols-2">
          <SummaryMetric
            label={(orders.customerType || t('customer')).toUpperCase()}
            value={
              orders.customer ? generateCustomerLabel(orders.customer) : '-'
            }
          />
          <SummaryMetric
            label={t('date')}
            value={paidDate ? dayjs(paidDate).format('YYYY-MM-DD HH:mm') : '-'}
            align="right"
          />
        </div>
      </div>

      <PosOrderExtraInfo orders={orders} responses={responses} />

      <DetailSection
        title={t('items-count', { count: items.length })}
        className="flex min-h-[220px] flex-1 flex-col space-y-3"
      >
        <PosOrderItemsTable items={items} />
      </DetailSection>

      <PosOrderPaymentSummary orders={orders} paidAmounts={paidAmounts} />
    </div>
  );
};
