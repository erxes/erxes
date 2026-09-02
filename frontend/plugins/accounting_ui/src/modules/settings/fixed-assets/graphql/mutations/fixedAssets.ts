import { gql } from '@apollo/client';

const categoryParamsDef = `
  $code: String!
  $name: String!
  $description: String
  $parentId: String
  $status: String
  $depreciationMethod: String
  $defaultAnnualDepreciationRate: Float
  $defaultSalvageValue: Float
  $taxDepreciationMethod: String
  $defaultTaxAnnualDepreciationRate: Float
  $defaultTaxSalvageValue: Float
`;

const categoryParams = `
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
`;

const assetParamsDef = `
  $code: String!
  $name: String!
  $categoryId: String!
  $description: String
  $status: String
  $depreciationMethod: String
  $annualDepreciationRate: Float
  $salvageValue: Float
  $taxDepreciationMethod: String
  $taxAnnualDepreciationRate: Float
  $taxSalvageValue: Float
  $propertiesData: JSON
`;

const assetParams = `
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
`;

export const FIXED_ASSET_CATEGORIES_ADD = gql`
  mutation fixedAssetCategoriesAdd(${categoryParamsDef}) {
    fixedAssetCategoriesAdd(${categoryParams}) {
      _id
    }
  }
`;

export const FIXED_ASSET_CATEGORIES_EDIT = gql`
  mutation fixedAssetCategoriesEdit($_id: String!, ${categoryParamsDef}) {
    fixedAssetCategoriesEdit(_id: $_id, ${categoryParams}) {
      _id
    }
  }
`;

export const FIXED_ASSET_CATEGORIES_REMOVE = gql`
  mutation fixedAssetCategoriesRemove($_id: String!) {
    fixedAssetCategoriesRemove(_id: $_id)
  }
`;

export const FIXED_ASSETS_ADD = gql`
  mutation fixedAssetsAdd(${assetParamsDef}) {
    fixedAssetsAdd(${assetParams}) {
      _id
    }
  }
`;

export const FIXED_ASSETS_EDIT = gql`
  mutation fixedAssetsEdit($_id: String!, ${assetParamsDef}) {
    fixedAssetsEdit(_id: $_id, ${assetParams}) {
      _id
    }
  }
`;

export const FIXED_ASSETS_REMOVE = gql`
  mutation fixedAssetsRemove($_id: String!) {
    fixedAssetsRemove(_id: $_id)
  }
`;

const ownerRecordFields = `
  _id
  fixedAssetId
  code
  sequence
  count
  action
  status
  ownerId
`;

export const FIXED_ASSET_OWNER_RECORDS_ADD = gql`
  mutation fixedAssetOwnerRecordsAdd(
    $fixedAssetId: String!
    $code: String
    $sequence: Int
    $count: Float!
    $action: String!
    $status: String
    $ownerId: String!
  ) {
    fixedAssetOwnerRecordsAdd(
      fixedAssetId: $fixedAssetId
      code: $code
      sequence: $sequence
      count: $count
      action: $action
      status: $status
      ownerId: $ownerId
    ) {
      ${ownerRecordFields}
    }
  }
`;

export const FIXED_ASSET_OWNER_RECORDS_TRANSFER = gql`
  mutation fixedAssetOwnerRecordsTransfer(
    $fixedAssetId: String!
    $code: String
    $sequence: Int
    $count: Float!
    $fromOwnerId: String!
    $toOwnerId: String!
  ) {
    fixedAssetOwnerRecordsTransfer(
      fixedAssetId: $fixedAssetId
      code: $code
      sequence: $sequence
      count: $count
      fromOwnerId: $fromOwnerId
      toOwnerId: $toOwnerId
    ) {
      ${ownerRecordFields}
    }
  }
`;

export const FIXED_ASSET_OWNER_RECORDS_REMOVE = gql`
  mutation fixedAssetOwnerRecordsRemove($_id: String!) {
    fixedAssetOwnerRecordsRemove(_id: $_id)
  }
`;
