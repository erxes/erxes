/*
 * Amounts kept as plain decimals (12.5, not minor units), as erxes 3.x kept them: a plugin that
 * stores them so rounds them with `fixNum` and shows them with `displayNum` and `formatAmount`
 * (lib/format.ts), to get 3.x's numbers. Amounts in minor units (core's products and invoices)
 * go through `formatMoney`.
 */

/**
 * A number, or "1,234.5" text, rounded to `p` decimals (4 by default).
 * Text that is no number reads as 0. It rounds twice, as 3.x did, so 1.005 × 100 rounds up.
 */
export const fixNum = (value: number | string | null | undefined, p = 4) => {
  const clean = Number(String(value ?? '').replaceAll(',', ''));

  if (Number.isNaN(clean)) return 0;

  const multiplier = 10 ** p;
  const big = Math.round(Number((clean * multiplier).toFixed(2)));

  return Number((big / multiplier).toFixed(p));
};
