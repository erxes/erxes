import { Card, RelativeDateDisplay, Separator } from 'erxes-ui';
import {
  IconBuildingStore,
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
} from '@tabler/icons-react';

import { INVOICE_DETAIL_BY_CONTENT } from '../graphql/posOrdersByDeal';
import { useQuery } from '@apollo/client';

type IPosOrder = {
  _id: string;
  number?: string;
  paidDate?: string;
  totalAmount?: number;
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: Array<{ type: string; amount: number; title?: string }>;
  posName?: string;
};

type IPaymentTransaction = {
  _id: string;
  paymentKind?: string;
  amount?: number;
  status?: string;
};

type IInvoiceWithTransactions = {
  _id: string;
  transactions?: IPaymentTransaction[];
};

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

export const PosOrderRow = ({ order }: { order: IPosOrder }) => {
  const hasMobile = !!order.mobileAmount && order.mobileAmount > 0;

  const { data: invoiceData } = useQuery(INVOICE_DETAIL_BY_CONTENT, {
    variables: { contentType: 'pos:orders', contentTypeId: order._id },
    skip: !hasMobile,
    fetchPolicy: 'network-only',
  });

  const entries: PaymentEntry[] = [];

  if (order.cashAmount) {
    entries.push({ label: 'Cash', amount: order.cashAmount, kind: 'cash' });
  }

  if (order.paidAmounts?.length) {
    for (const paidAmount of order.paidAmounts) {
      entries.push({
        label: paidAmount.title || capitalize(paidAmount.type),
        amount: Number(paidAmount.amount) || 0,
        kind: 'card',
      });
    }
  }

  if (hasMobile) {
    const invoices: IInvoiceWithTransactions[] =
      invoiceData?.invoiceDetailByContent || [];

    const byKind: Record<string, number> = {};

    for (const invoice of invoices) {
      for (const transaction of invoice.transactions || []) {
        if (transaction.status !== 'paid') {
          continue;
        }

        const kind = transaction.paymentKind || 'mobile';
        byKind[kind] = (byKind[kind] || 0) + (Number(transaction.amount) || 0);
      }
    }

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
            No payment details
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
