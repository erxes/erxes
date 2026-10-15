import { gql } from '~/gql';

export const FIXED_ASSET_CATEGORIES_ADD = gql(`
mutation accountingFixedAssetCategoriesAdd($code: String!, $name: String!, $description: String, $parentId: String, $status: String, $depreciationMethod: String, $defaultAnnualDepreciationRate: Float, $defaultSalvageValue: Float, $taxDepreciationMethod: String, $defaultTaxAnnualDepreciationRate: Float, $defaultTaxSalvageValue: Float) {
  fixedAssetCategoriesAdd(
    code: $code
    name: $name
    description: $description
    parentId: $parentId
    status: $status
    depreciationMethod: $depreciationMethod
    defaultAnnualDepreciationRate: $defaultAnnualDepreciationRate
    defaultSalvageValue: $defaultSalvageValue
    taxDepreciationMethod: $taxDepreciationMethod
    defaultTaxAnnualDepreciationRate: $defaultTaxAnnualDepreciationRate
    defaultTaxSalvageValue: $defaultTaxSalvageValue
  ) {
    _id
  }
}
`);

export const FIXED_ASSET_CATEGORIES_EDIT = gql(`
mutation accountingFixedAssetCategoriesEdit($_id: String!, $code: String!, $name: String!, $description: String, $parentId: String, $status: String, $depreciationMethod: String, $defaultAnnualDepreciationRate: Float, $defaultSalvageValue: Float, $taxDepreciationMethod: String, $defaultTaxAnnualDepreciationRate: Float, $defaultTaxSalvageValue: Float) {
  fixedAssetCategoriesEdit(
    _id: $_id
    code: $code
    name: $name
    description: $description
    parentId: $parentId
    status: $status
    depreciationMethod: $depreciationMethod
    defaultAnnualDepreciationRate: $defaultAnnualDepreciationRate
    defaultSalvageValue: $defaultSalvageValue
    taxDepreciationMethod: $taxDepreciationMethod
    defaultTaxAnnualDepreciationRate: $defaultTaxAnnualDepreciationRate
    defaultTaxSalvageValue: $defaultTaxSalvageValue
  ) {
    _id
  }
}
`);

export const FIXED_ASSET_CATEGORIES_REMOVE = gql(`
mutation accountingFixedAssetCategoriesRemove($_id: String!) {
  fixedAssetCategoriesRemove(_id: $_id)
}
`);

export const FIXED_ASSETS_ADD = gql(`
mutation accountingFixedAssetsAdd($code: String!, $name: String!, $categoryId: String!, $description: String, $status: String, $depreciationMethod: String, $annualDepreciationRate: Float, $salvageValue: Float, $taxDepreciationMethod: String, $taxAnnualDepreciationRate: Float, $taxSalvageValue: Float, $propertiesData: JSON) {
  fixedAssetsAdd(
    code: $code
    name: $name
    categoryId: $categoryId
    description: $description
    status: $status
    depreciationMethod: $depreciationMethod
    annualDepreciationRate: $annualDepreciationRate
    salvageValue: $salvageValue
    taxDepreciationMethod: $taxDepreciationMethod
    taxAnnualDepreciationRate: $taxAnnualDepreciationRate
    taxSalvageValue: $taxSalvageValue
    propertiesData: $propertiesData
  ) {
    _id
  }
}
`);

export const FIXED_ASSETS_EDIT = gql(`
mutation accountingFixedAssetsEdit($_id: String!, $code: String!, $name: String!, $categoryId: String!, $description: String, $status: String, $depreciationMethod: String, $annualDepreciationRate: Float, $salvageValue: Float, $taxDepreciationMethod: String, $taxAnnualDepreciationRate: Float, $taxSalvageValue: Float, $propertiesData: JSON) {
  fixedAssetsEdit(
    _id: $_id
    code: $code
    name: $name
    categoryId: $categoryId
    description: $description
    status: $status
    depreciationMethod: $depreciationMethod
    annualDepreciationRate: $annualDepreciationRate
    salvageValue: $salvageValue
    taxDepreciationMethod: $taxDepreciationMethod
    taxAnnualDepreciationRate: $taxAnnualDepreciationRate
    taxSalvageValue: $taxSalvageValue
    propertiesData: $propertiesData
  ) {
    _id
  }
}
`);

export const FIXED_ASSETS_REMOVE = gql(`
mutation accountingFixedAssetsRemove($_id: String!) {
  fixedAssetsRemove(_id: $_id)
}
`);

export const FIXED_ASSET_OWNER_RECORDS_ADD = gql(`
mutation accountingFixedAssetOwnerRecordsAdd($fixedAssetId: String!, $code: String, $sequence: Int, $count: Float!, $action: String!, $status: String, $ownerId: String!) {
  fixedAssetOwnerRecordsAdd(
    fixedAssetId: $fixedAssetId
    code: $code
    sequence: $sequence
    count: $count
    action: $action
    status: $status
    ownerId: $ownerId
  ) {
    _id
    fixedAssetId
    code
    sequence
    count
    action
    status
    ownerId
  }
}
`);

export const FIXED_ASSET_OWNER_RECORDS_TRANSFER = gql(`
mutation accountingFixedAssetOwnerRecordsTransfer($fixedAssetId: String!, $code: String, $sequence: Int, $count: Float!, $fromOwnerId: String!, $toOwnerId: String!) {
  fixedAssetOwnerRecordsTransfer(
    fixedAssetId: $fixedAssetId
    code: $code
    sequence: $sequence
    count: $count
    fromOwnerId: $fromOwnerId
    toOwnerId: $toOwnerId
  ) {
    _id
    fixedAssetId
    code
    sequence
    count
    action
    status
    ownerId
  }
}
`);

export const FIXED_ASSET_OWNER_RECORDS_REMOVE = gql(`
mutation accountingFixedAssetOwnerRecordsRemove($_id: String!) {
  fixedAssetOwnerRecordsRemove(_id: $_id)
}
`);
