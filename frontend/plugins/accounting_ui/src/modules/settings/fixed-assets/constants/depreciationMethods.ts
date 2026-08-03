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
    label: 'Шулуун шугамын арга',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[1],
    label: 'Жилийн нийлбэрийн арга',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[2],
    label: 'Давхар буурах үлдэгдлийн арга',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[3],
    label: 'Үлдэгдэл бууруулах арга',
  },
  {
    value: FIXED_ASSET_DEPRECIATION_METHOD_VALUES[4],
    label: 'Дурын дүнгээр',
  },
] as const;
