import { gql } from '@apollo/client';

export const fixedAssetCategoryFields = `
  _id
  code
  name
  description
  parentId
  status
  depreciationMethod
  defaultUsefulLife
  defaultSalvageValue
  taxDepreciationMethod
  defaultTaxUsefulLife
  defaultTaxSalvageValue
`;

export const fixedAssetFields = `
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
  usefulLife
  salvageValue
  taxDepreciationMethod
  taxUsefulLife
  taxSalvageValue
  propertiesData
`;

export const GET_FIXED_ASSET_CATEGORIES = gql`
  query fixedAssetCategories($searchValue: String) {
    fixedAssetCategories(searchValue: $searchValue) {
      ${fixedAssetCategoryFields}
    }
  }
`;

export const GET_FIXED_ASSET_CATEGORY_DETAIL = gql`
  query fixedAssetCategoryDetail($id: String!) {
    fixedAssetCategoryDetail(_id: $id) {
      ${fixedAssetCategoryFields}
    }
  }
`;

export const GET_FIXED_ASSETS = gql`
  query fixedAssets($searchValue: String, $ids: [String], $categoryId: String) {
    fixedAssets(
      searchValue: $searchValue
      ids: $ids
      categoryId: $categoryId
      limit: 200
    ) {
      ${fixedAssetFields}
    }
  }
`;

export const GET_FIXED_ASSET_DETAIL = gql`
  query fixedAssetDetail($id: String!) {
    fixedAssetDetail(_id: $id) {
      ${fixedAssetFields}
    }
  }
`;

export const GET_FIXED_ASSET_LOCATION_REMAINDER = gql`
  query fixedAssetLocationRemainder(
    $fixedAssetId: String!
    $branchId: String
    $departmentId: String
    $date: Date
    $excludeTransactionId: String
  ) {
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
`;

export const fxaOwnerRecordFields = `
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
`;

export const GET_FXA_OWNER_RECORDS = gql`
  query AccountingFixedAssetOwnerRecords(
    $searchValue: String
    $fixedAssetId: String
    $categoryId: String
    $action: String
    $ownerId: String
    $status: String
    $createdFrom: Date
    $createdTo: Date
    $page: Int
    $perPage: Int
  ) {
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
      ${fxaOwnerRecordFields}
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
`;
