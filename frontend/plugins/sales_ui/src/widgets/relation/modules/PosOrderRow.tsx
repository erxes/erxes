import { Card, RelativeDateDisplay, Separator } from 'erxes-ui';
import {
  IconBuildingStore,
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
} from '@tabler/icons-react';

import { INVOICE_DETAIL_BY_CONTENT } from '../graphql/posOrdersByDeal';
import type { IDealPosOrder } from '../types/posOrders';
import {
  sumPaidTransactionsByKind,
  toDealPosPaidAmounts,
} from '../utils/posOrderPaidAmounts';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

type PaymentKind = 'cash' | 'card' | 'mobile';

type PaymentEntry = {
  label: string;
  amount: number;
  kind: PaymentKind;
};

const capitalize = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const formatAmount = (amount: number) => amount.toLocaleString();

const PaymentIcon = ({ kind }: { kind: PaymentKind }) => {
  if (kind === 'cash') {
    return <IconCash className="size-3.5 shrink-0" />;
  }
  if (kind === 'mobile') {
    return <IconDeviceMobile className="size-3.5 shrink-0" />;
  }
  return <IconCreditCard className="size-3.5 shrink-0" />;
};

export const PosOrderRow = ({ order }: { order: IDealPosOrder }) => {
  const { t } = useTranslation('sales');
  const hasMobile = !!order.mobileAmount && order.mobileAmount > 0;

  const { data: invoiceData } = useQuery(INVOICE_DETAIL_BY_CONTENT, {
    variables: { contentType: 'sales:pos:order', contentTypeId: order._id },
    skip: !hasMobile,
    fetchPolicy: 'network-only',
  });

  const entries: PaymentEntry[] = [];

  if (order.cashAmount) {
    entries.push({
      label: t('payment-cash', 'Cash'),
      amount: order.cashAmount,
      kind: 'cash',
    });
  }

  for (const paidAmount of toDealPosPaidAmounts(order.paidAmounts)) {
    entries.push({
      label: paidAmount.title || capitalize(paidAmount.type),
      amount: paidAmount.amount,
      kind: 'card',
    });
  }

  if (hasMobile) {
    const byKind = sumPaidTransactionsByKind(
      invoiceData?.invoiceDetailByContent,
    );

    for (const [kind, amount] of Object.entries(byKind)) {
      entries.push({ label: capitalize(kind), amount, kind: 'mobile' });
    }
  }

  return (
    <Card className="bg-background overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 h-9">
        <span className="font-semibold text-sm truncate min-w-0">
          #{order.number || order._id}
        </span>
        {order.paidDate && (
          <RelativeDateDisplay value={order.paidDate} asChild>
            <span className="text-xs text-muted-foreground shrink-0 cursor-default">
              <RelativeDateDisplay.Value value={order.paidDate} isShort />
            </span>
          </RelativeDateDisplay>
        )}
      </div>
      <Separator />
      <div className="p-3 flex flex-col gap-2">
        {entries.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {entries.map((entry, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <PaymentIcon kind={entry.kind} />
                  <span className="truncate min-w-0">{entry.label}</span>
                </span>
                <span className="font-medium text-foreground tabular-nums shrink-0">
                  {formatAmount(entry.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-muted-foreground">
            {t('no-payment-details', 'No payment details')}
          </span>
        )}
      </div>
      <Separator />
      <div className="px-3 h-9 flex items-center justify-between gap-2 text-xs">
        {order.posName ? (
          <span className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <IconBuildingStore className="size-3.5 shrink-0" />
            <span className="truncate min-w-0">{order.posName}</span>
          </span>
        ) : (
          <span />
        )}
        <span className="font-semibold text-foreground tabular-nums shrink-0">
          {formatAmount(order.totalAmount || 0)}
        </span>
      </div>
    </Card>
  );
};
