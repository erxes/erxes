export const FIXED_ASSET_DEPRECIATION_METHOD_VALUES = [
  'straightLine',
  'sumOfYearsDigits',
  'doubleDecliningBalance',
  'decliningBalance',
  'manual',
] as const;

export const FIXED_ASSET_DEPRECIATION_METHODS = [
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[0],
    label: 'straight-line-method',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[1],
    label: 'sum-of-the-years-digits-method',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[2],
    label: 'double-declining-balance-method',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[3],
    label: 'declining-balance-method',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[4],
    label: 'custom-amount',
  },
] as const;
