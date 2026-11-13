import { ITrDetail } from '@/transactions/types/Transaction';

export const getTotalFxaDepreciation = (
  details: ITrDetail[],
  rule: 'preDeprecation' | 'taxPreDeprecation' = 'preDeprecation',
): number | undefined => {
  const entered = details.filter(
    (detail) => detail.followInfos?.[rule] !== undefined,
  );
  return entered.length
    ? entered.reduce(
        (sum, detail) => sum + (detail.followInfos?.[rule] ?? 0),
        0,
      )
    : undefined;
};

export const allocateFxaDepreciation = (
  total: number,
  counts: number[],
): number[] => {
  const count = counts.reduce((sum, value) => sum + value, 0);
  let allocated = 0;
  return counts.map((value, index) => {
    const amount =
      index === counts.length - 1
        ? total - allocated
        : Math.round(((total * value) / (count || 1)) * 10000) / 10000;
    allocated += amount;
    return Math.round(amount * 10000) / 10000;
  });
};

export const getFxaRevaluationTaxTotal = (
  bookTotal: number,
  previousBookTotal: number,
  previousTaxTotal?: number | null,
): number =>
  (previousTaxTotal ?? previousBookTotal) + bookTotal - previousBookTotal;
