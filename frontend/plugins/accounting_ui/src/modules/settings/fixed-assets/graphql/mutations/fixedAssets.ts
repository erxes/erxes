import { gql } from '@apollo/client';

const categoryParamsDef = `
  $code: String!
  $name: String!
  $description: String
  $parentId: String
  $status: String
  $depreciationMethod: String
  $defaultUsefulLife: Float
  $defaultSalvageValue: Float
  $taxDepreciationMethod: String
  $defaultTaxUsefulLife: Float
  $defaultTaxSalvageValue: Float
`;

const categoryParams = `
  code: $code
  name: $name
  description: $description
  parentId: $parentId
  status: $status
  depreciationMethod: $depreciationMethod
  defaultUsefulLife: $defaultUsefulLife
  defaultSalvageValue: $defaultSalvageValue
  taxDepreciationMethod: $taxDepreciationMethod
  defaultTaxUsefulLife: $defaultTaxUsefulLife
  defaultTaxSalvageValue: $defaultTaxSalvageValue
`;

const assetParamsDef = `
  $code: String!
  $name: String!
  $categoryId: String!
  $description: String
  $status: String
  $depreciationMethod: String
  $usefulLife: Float
  $salvageValue: Float
  $taxDepreciationMethod: String
  $taxUsefulLife: Float
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
  usefulLife: $usefulLife
  salvageValue: $salvageValue
  taxDepreciationMethod: $taxDepreciationMethod
  taxUsefulLife: $taxUsefulLife
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
