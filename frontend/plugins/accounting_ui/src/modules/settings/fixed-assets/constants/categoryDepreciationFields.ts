export const FIXED_ASSET_CATEGORY_DEPRECIATION_FIELDS = [
  {
    method: 'depreciationMethod',
    methodLabel: 'depreciation-method',
    methodPlaceholder: 'select-depreciation-method',
    usefulLife: 'defaultUsefulLife',
    usefulLifeLabel: 'useful-life-in-years',
    rate: 'defaultAnnualDepreciationRate',
    rateLabel: 'annual-depreciation-rate',
    salvage: 'defaultSalvageValue',
    salvageLabel: 'residual-value',
  },
  {
    method: 'taxDepreciationMethod',
    methodLabel: 'tax-depreciation-method',
    methodPlaceholder: 'select-tax-depreciation-method',
    usefulLife: 'defaultTaxUsefulLife',
    usefulLifeLabel: 'tax-useful-life-in-years',
    rate: 'defaultTaxAnnualDepreciationRate',
    rateLabel: 'annual-tax-depreciation-rate',
    salvage: 'defaultTaxSalvageValue',
    salvageLabel: 'tax-residual-value',
  },
] as const;
