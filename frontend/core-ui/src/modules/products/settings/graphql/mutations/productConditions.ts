import { gql } from '@apollo/client';

const conditionFields = `
  _id
  code
  name
  description
  productCount
`;

export const PRODUCT_CONDITIONS_ADD = gql`
  mutation productConditionsAdd(
    $code: String!
    $name: String!
    $description: String
  ) {
    productConditionsAdd(code: $code, name: $name, description: $description) {
      ${conditionFields}
    }
  }
`;

export const PRODUCT_CONDITIONS_EDIT = gql`
  mutation productConditionsEdit(
    $_id: String!
    $code: String!
    $name: String!
    $description: String
  ) {
    productConditionsEdit(
      _id: $_id
      code: $code
      name: $name
      description: $description
    ) {
      ${conditionFields}
    }
  }
`;

export const PRODUCT_CONDITIONS_REMOVE = gql`
  mutation productConditionsRemove($_ids: [String!]!) {
    productConditionsRemove(_ids: $_ids)
  }
`;

export const PRODUCT_CATEGORY_SET_CONDITION_CODES = gql`
  mutation productCategorySetConditionCodes(
    $categoryId: String!
    $codes: [String!]!
    $mode: ProductConditionCodesMode!
  ) {
    productCategorySetConditionCodes(
      categoryId: $categoryId
      codes: $codes
      mode: $mode
    )
  }
`;

export const PRODUCTS_SET_CONDITION_CODES = gql`
  mutation productsSetConditionCodes(
    $productIds: [String!]!
    $codes: [String!]!
    $mode: ProductConditionCodesMode!
  ) {
    productsSetConditionCodes(
      productIds: $productIds
      codes: $codes
      mode: $mode
    )
  }
`;
