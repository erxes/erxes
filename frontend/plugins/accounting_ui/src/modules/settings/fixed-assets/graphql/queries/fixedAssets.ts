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
  query fixedAssets($searchValue: String, $categoryId: String) {
    fixedAssets(searchValue: $searchValue, categoryId: $categoryId, limit: 200) {
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
