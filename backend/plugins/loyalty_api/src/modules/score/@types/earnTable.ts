// `base`: only the first matching base row earns. `bonus`: every matching
// bonus row adds on top.
export type TEarnRowKind = 'base' | 'bonus';

// How a row's value reads. `percent`: N% of the amount, turned into points by
// the wallet's money-per-point rate. `multiplier`: on a base row, the amount's
// points at that rate times N; on a bonus row, the base points times N, of
// which the base already gave one. `fixed`: N points (bonus).
export type TEarnValueType = 'percent' | 'fixed' | 'multiplier';

export interface IEarnValue {
  value: number;
}

// Same shape as a campaign's restrictions: comma-separated ids.
export interface IEarnProductConditions {
  productCategoryIds?: string;
  productIds?: string;
  tagIds?: string;
  excludeProductCategoryIds?: string;
  excludeProductIds?: string;
  excludeTagIds?: string;
}

export interface IEarnConditions {
  minAmount?: number;
  maxAmount?: number;
  // Narrows both whether the row applies and the amount it counts.
  products?: IEarnProductConditions;
  firstPurchase?: boolean;
  sources?: string[];
}

export interface IEarnRow {
  // What an automation's row selection refers to; kept across edits.
  key: string;
  name: string;
  kind: TEarnRowKind;
  valueType: TEarnValueType;
  conditions: IEarnConditions;
  // 'all' (same for everyone), or 'none' (no tier) and tier keys.
  values: Record<string, IEarnValue>;
  cap?: number;
}

export interface IEarnTable {
  amountSource: 'paid' | 'total';
  rounding: 'floor' | 'round' | 'none';
  rows: IEarnRow[];
}

/** How a row's points came about, kept so they can be explained later. */
export interface IEarnCalc {
  valueType: TEarnValueType;
  value: number;
  // The tier column the value came from: `all`, a tier key, or `none`.
  column: string;
  // Money the row counted, and money per point.
  amount?: number;
  ratio?: number;
  // What a multiplier bonus multiplied.
  basePoints?: number;
  // The cap that cut the row's points down.
  cap?: number;
  // What one point pays, to show the points as money.
  pointValue?: number;
}

export interface IEarnBreakdownItem {
  rowKey: string;
  name: string;
  points: number;
  calc?: IEarnCalc;
}

export interface IEarnContext {
  // Money per point of the account type the campaign earns into.
  ratio: number;
  // Money one point pays, when known.
  pointValue?: number;
  tier?: string | null;
  totalAmount: number;
  paidAmount: number;
  // Amount of the items a row's product conditions allow, by row key.
  scopedAmounts: Record<string, number>;
  source?: string;
  firstPurchase: boolean;
}

export type TEarnCondition =
  | 'minAmount'
  | 'maxAmount'
  | 'firstPurchase'
  | 'sources'
  | 'products';

// Why a campaign moved no points; the automation history shows every one.
export type TScoreSkip =
  | { reason: 'no-rows' }
  | { reason: 'no-tier-value'; tier: string }
  | {
      reason: 'conditions-not-met';
      rows: { name: string; unmet: TEarnCondition }[];
    }
  | { reason: 'no-amount'; amountSource: IEarnTable['amountSource'] }
  | { reason: 'rounded-to-zero' }
  // Spendable only after the next reset, which would clear it first.
  | { reason: 'held-past-reset'; availableAt: string; resetsAt: string };
