import { gql } from '~/gql';

export const GET_FIXED_ASSET_CATEGORIES = gql(`
query accountingFixedAssetCategories($searchValue: String) {
  fixedAssetCategories(searchValue: $searchValue) {
    _id
    code
    name
    description
    parentId
    status
    depreciationMethod
    defaultAnnualDepreciationRate
    defaultSalvageValue
    taxDepreciationMethod
    defaultTaxAnnualDepreciationRate
    defaultTaxSalvageValue
  }
}
`);

export const GET_FIXED_ASSET_CATEGORY_DETAIL = gql(`
query accountingFixedAssetCategoryDetail($id: String!) {
  fixedAssetCategoryDetail(_id: $id) {
    _id
    code
    name
    description
    parentId
    status
    depreciationMethod
    defaultAnnualDepreciationRate
    defaultSalvageValue
    taxDepreciationMethod
    defaultTaxAnnualDepreciationRate
    defaultTaxSalvageValue
  }
}
`);

export const GET_FIXED_ASSETS = gql(`
query accountingSettingsFixedAssets($searchValue: String, $ids: [String], $categoryId: String) {
  fixedAssets(
    searchValue: $searchValue
    ids: $ids
    categoryId: $categoryId
    limit: 200
  ) {
    _id
    code
    name
    categoryId
    description
    status
    accountId
    count
    currentCount
    originalCost
    depreciationMethod
    annualDepreciationRate
    salvageValue
    taxDepreciationMethod
    taxAnnualDepreciationRate
    taxSalvageValue
    propertiesData
  }
}
`);

export const GET_FIXED_ASSET_DETAIL = gql(`
query accountingFixedAssetDetail($id: String!) {
  fixedAssetDetail(_id: $id) {
    _id
    code
    name
    categoryId
    description
    status
    accountId
    count
    currentCount
    originalCost
    depreciationMethod
    annualDepreciationRate
    salvageValue
    taxDepreciationMethod
    taxAnnualDepreciationRate
    taxSalvageValue
    propertiesData
  }
}
`);

export const GET_FIXED_ASSET_LOCATION_REMAINDER = gql(`
query accountingFixedAssetLocationRemainder($fixedAssetId: String!, $branchId: String, $departmentId: String, $date: Date, $excludeTransactionId: String) {
  fixedAssetLocationRemainder(
    fixedAssetId: $fixedAssetId
    branchId: $branchId
    departmentId: $departmentId
    date: $date
    excludeTransactionId: $excludeTransactionId
  ) {
    fixedAssetId
    branchId
    departmentId
    remainder
  }
}
`);

export const GET_FIXED_ASSET_LOCATION_REMAINDERS = gql(`
query AccountingFixedAssetLocationRemainders($searchValue: String, $fixedAssetId: String, $categoryId: String, $branchId: String, $departmentId: String, $date: Date, $limit: Int) {
  fixedAssetLocationRemainders(
    searchValue: $searchValue
    fixedAssetId: $fixedAssetId
    categoryId: $categoryId
    branchId: $branchId
    departmentId: $departmentId
    date: $date
    limit: $limit
  ) {
    fixedAssetId
    branchId
    departmentId
    remainder
  }
}
`);

export const GET_FXA_OWNER_RECORDS = gql(`
query AccountingFixedAssetOwnerRecords($searchValue: String, $fixedAssetId: String, $categoryId: String, $action: String, $ownerId: String, $status: String, $createdFrom: Date, $createdTo: Date, $page: Int, $perPage: Int) {
  fxaOwnerRecords(
    searchValue: $searchValue
    fixedAssetId: $fixedAssetId
    categoryId: $categoryId
    action: $action
    ownerId: $ownerId
    status: $status
    createdFrom: $createdFrom
    createdTo: $createdTo
    page: $page
    perPage: $perPage
  ) {
    _id
    fixedAssetId
    code
    sequence
    count
    action
    status
    ownerId
    transactionId
    transactionDetailId
    createdAt
    updatedAt
    createdBy
    modifiedBy
  }
  fxaOwnerRecordsCount(
    searchValue: $searchValue
    fixedAssetId: $fixedAssetId
    categoryId: $categoryId
    action: $action
    ownerId: $ownerId
    status: $status
    createdFrom: $createdFrom
    createdTo: $createdTo
  )
}
`);
