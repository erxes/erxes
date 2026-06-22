import {
  TFixedAssetCategoryForm,
  TFixedAssetForm,
} from '../types/FixedAsset';

export const FIXED_ASSET_CATEGORY_DEFAULT_VALUES: TFixedAssetCategoryForm = {
  code: '',
  name: '',
  description: '',
  parentId: '',
  status: 'active',
  accounts: {},
  depreciationMethod: 'straightLine',
  defaultUsefulLife: undefined,
  defaultSalvageValue: undefined,
  taxDepreciationMethod: 'straightLine',
  defaultTaxUsefulLife: undefined,
  defaultTaxSalvageValue: undefined,
};

export const FIXED_ASSET_DEFAULT_VALUES: TFixedAssetForm = {
  code: '',
  name: '',
  categoryId: '',
  description: '',
  status: 'active',
  accounts: {},
  depreciationMethod: '',
  usefulLife: undefined,
  salvageValue: undefined,
  taxDepreciationMethod: '',
  taxUsefulLife: undefined,
  taxSalvageValue: undefined,
  propertiesData: {},
};
