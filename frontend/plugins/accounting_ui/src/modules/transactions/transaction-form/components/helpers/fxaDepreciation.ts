import { ITrDetail } from '@/transactions/types/Transaction';

export const getTotalFxaDepreciation = (
  details: ITrDetail[],
): number | undefined => {
  const entered = details.filter(
    (detail) => detail.followInfos?.preDeprecation !== undefined,
  );
  return entered.length
    ? entered.reduce(
        (sum, detail) => sum + (detail.followInfos?.preDeprecation ?? 0),
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
