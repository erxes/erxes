// `base`: only the first matching base row earns. `bonus`: every matching
// bonus row adds on top.
export type TEarnRowKind = 'base' | 'bonus';

// `percent`: N% of the amount, through the wallet's rate. `multiplier`: on a
// base row the rate's points times N; on a bonus row the base points times N,
// of which the base already gave one. `fixed`: N points (bonus).
export type TEarnValueType = 'percent' | 'fixed' | 'multiplier';

// What the API stores and returns for a campaign's earning table.
export interface IEarnTableInput {
  amountSource: 'paid' | 'total';
  rounding: 'floor' | 'round' | 'none';
  rows: {
    key?: string;
    name: string;
    kind: TEarnRowKind;
    valueType: TEarnValueType;
    cap?: number;
    values: Record<string, { value: number }>;
    conditions: {
      minAmount?: number;
      maxAmount?: number;
      firstPurchase?: boolean;
      sources?: string[];
      products?: {
        productCategoryIds?: string;
        productIds?: string;
        tagIds?: string;
      };
    };
  }[];
}

// A row is either the same for everyone (`all`) or set per column: `none`
// for owners without a tier, then each tier; an empty cell earns nothing.
export const EARN_ALL_TIERS = 'all';
export const EARN_NO_TIER = 'none';

export const EARN_SCOPES = ['all', 'tiers'] as const;

export const EARN_ROW_KINDS: TEarnRowKind[] = ['base', 'bonus'];

// What each kind of row may be, first being the default for a new row.
export const EARN_VALUE_TYPES: Record<TEarnRowKind, TEarnValueType[]> = {
  base: ['percent', 'multiplier'],
  bonus: ['percent', 'fixed', 'multiplier'],
};

// A row keeps its value type when the new kind allows it.
export const earnValueTypeFor = (
  kind: TEarnRowKind,
  current?: TEarnValueType,
): TEarnValueType =>
  current && EARN_VALUE_TYPES[kind].includes(current)
    ? current
    : EARN_VALUE_TYPES[kind][0];
