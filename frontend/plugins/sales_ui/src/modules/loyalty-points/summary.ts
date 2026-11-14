// What a source's loyalty sums read as on screen; any source (deals, POS
// orders) maps its own GraphQL answer through these.

const ACTION_KIND: Record<string, 'earned' | 'spent' | 'refunded' | 'other'> = {
  add: 'earned',
  subtract: 'spent',
  refund: 'refunded',
  return: 'refunded',
};

export type TTimelineInterval = 'day' | 'week' | 'month';

export type TRankedRow = { id: string; value: number };

export type TGroupLine = {
  id: string;
  name: string;
  parent?: string;
  earned: number;
  spent: number;
  refunded: number;
  recalculated: number;
  net: number;
  refundRate: number;
};

// Share of what was earned, in whole percent; nothing earned reads as 0.
export const rate = (part: number, earned: number) =>
  earned > 0 ? Math.round((Math.abs(part) / earned) * 100) : 0;

export const rankedRows = (
  rows: { id: string; earned: number; spent: number }[] | undefined | null,
  kind: 'earned' | 'spent',
): TRankedRow[] =>
  (rows || []).map(({ id, earned, spent }) => ({
    id,
    value: Math.abs(kind === 'earned' ? earned : spent),
  }));

/** The tiles' figures: kinds as first given, recalculations apart. */
export const summarize = (
  insights:
    | {
        totals?: { action: string; total: number }[] | null;
        recalculatedEarned?: number | null;
        recalculatedSpent?: number | null;
        net?: number | null;
        customerCount?: number | null;
      }
    | null
    | undefined,
) => {
  const kinds = { earned: 0, spent: 0, refunded: 0, other: 0 };

  for (const { action, total } of insights?.totals || []) {
    kinds[ACTION_KIND[action] || 'other'] += total;
  }

  // Rates read what is earned now.
  const recalculatedEarned = insights?.recalculatedEarned ?? 0;
  const recalculatedSpent = insights?.recalculatedSpent ?? 0;
  const earnedNow = kinds.earned + recalculatedEarned;

  return {
    kinds,
    net: insights?.net ?? 0,
    customerCount: insights?.customerCount ?? 0,
    recalculated: recalculatedEarned + recalculatedSpent,
    spendRate: rate(kinds.spent + recalculatedSpent, earnedNow),
    refundRate: rate(kinds.refunded, earnedNow),
  };
};

export type TLoyaltySummary = ReturnType<typeof summarize>;

/** A group's row (a pipeline, a POS) for the per-group table. */
export const groupLine = (line: {
  id?: string | null;
  name?: string | null;
  parent?: string | null;
  earned: number;
  spent: number;
  refunded: number;
  recalculated: number;
  net: number;
}): TGroupLine => ({
  id: line.id || '',
  name: line.name || '—',
  parent: line.parent || undefined,
  earned: line.earned,
  spent: line.spent,
  refunded: line.refunded,
  recalculated: line.recalculated,
  net: line.net,
  refundRate: rate(line.refunded, line.earned + line.recalculated),
});

// Periods come keyed `2026-11-05`, `2026-W45` or `2026-11`.
const periodLabel = (key: string, interval: TTimelineInterval) => {
  if (interval === 'week') {
    return key.slice(5);
  }

  return interval === 'day' ? key.slice(5).replace('-', '/') : key;
};

export type TPeriod = {
  key: string;
  label: string;
  earned: number;
  spent: number;
  refunded: number;
  other: number;
  recalculated: number;
  net: number;
  cumulative: number;
};

/** A timeline answer as the charts read it. */
export const toPeriods = (
  buckets: Omit<TPeriod, 'label'>[] | null | undefined,
  interval: TTimelineInterval,
): TPeriod[] =>
  (buckets || []).map((bucket) => ({
    ...bucket,
    label: periodLabel(bucket.key, interval),
  }));

export const isQuiet = (periods: TPeriod[]) =>
  periods.every(
    ({ earned, spent, refunded, other, recalculated }) =>
      !earned && !spent && !refunded && !other && !recalculated,
  );
