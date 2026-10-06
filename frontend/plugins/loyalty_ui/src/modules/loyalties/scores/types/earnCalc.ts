// How an earning row's points came about, as loyalty recorded it.
export type TEarnCalc = {
  valueType: 'percent' | 'fixed' | 'multiplier';
  value: number;
  // `all`, a tier key, or `none` for owners without a tier.
  column: string;
  amount?: number;
  ratio?: number;
  basePoints?: number;
  cap?: number;
  pointValue?: number;
};

export type TEarnBreakdownItem = {
  rowKey: string;
  name: string;
  points: number;
  // Missing on entries written before calculations were kept.
  calc?: TEarnCalc | null;
};
