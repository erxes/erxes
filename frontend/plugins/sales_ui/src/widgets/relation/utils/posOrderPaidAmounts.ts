import { isRecord } from '@/deals/utils/dealJson';
import type { InvoiceDetailByContentQuery } from '~/gql/graphql';

export type DealPosPaidAmount = {
  type: string;
  title: string;
  amount: number;
};

// paidAmounts is JSON. The panel lists array entries only, as before; legacy
// map payloads stay hidden and non-object entries are skipped.
export const toDealPosPaidAmounts = (value: unknown): DealPosPaidAmount[] =>
  Array.isArray(value)
    ? value.filter(isRecord).map((entry) => ({
        type: typeof entry.type === 'string' ? entry.type : '',
        title: typeof entry.title === 'string' ? entry.title : '',
        amount: Number(entry.amount) || 0,
      }))
    : [];

// Paid transaction totals by payment kind; untyped kinds count as mobile.
export const sumPaidTransactionsByKind = (
  invoices?: InvoiceDetailByContentQuery['invoiceDetailByContent'],
): Record<string, number> => {
  const byKind: Record<string, number> = {};

  for (const transaction of (invoices ?? []).flatMap(
    (invoice) => invoice?.transactions ?? [],
  )) {
    if (transaction?.status === 'paid') {
      const kind = transaction.paymentKind || 'mobile';
      byKind[kind] = (byKind[kind] || 0) + (Number(transaction.amount) || 0);
    }
  }

  return byKind;
};
