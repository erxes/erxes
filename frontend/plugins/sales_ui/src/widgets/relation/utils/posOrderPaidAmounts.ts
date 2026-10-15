import { isRecord } from '@/deals/utils/dealJson';

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
