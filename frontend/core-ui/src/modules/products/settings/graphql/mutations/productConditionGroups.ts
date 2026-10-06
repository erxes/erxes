import { gql } from '@apollo/client';

const groupFields = `
  _id
  name
  description
  conditions {
    _id
    name
  }
`;

export const PRODUCT_CONDITION_GROUPS_ADD = gql`
  mutation productConditionGroupsAdd(
    $name: String!
    $description: String
    $conditions: [ProductConditionInput]
  ) {
    productConditionGroupsAdd(
      name: $name
      description: $description
      conditions: $conditions
    ) {
      ${groupFields}
    }
  }
`;

export const PRODUCT_CONDITION_GROUPS_EDIT = gql`
  mutation productConditionGroupsEdit(
    $_id: String!
    $name: String!
    $description: String
    $conditions: [ProductConditionInput]
  ) {
    productConditionGroupsEdit(
      _id: $_id
      name: $name
      description: $description
      conditions: $conditions
    ) {
      ${groupFields}
    }
  }
`;

export const PRODUCT_CONDITION_GROUPS_REMOVE = gql`
  mutation productConditionGroupsRemove($_ids: [String!]!) {
    productConditionGroupsRemove(_ids: $_ids)
  }
`;

export const PRODUCT_CATEGORY_SET_CONDITION_GROUP = gql`
  mutation productCategorySetConditionGroup(
    $categoryId: String!
    $conditionGroupId: String
  ) {
    productCategorySetConditionGroup(
      categoryId: $categoryId
      conditionGroupId: $conditionGroupId
    )
  }
`;

export const PRODUCTS_SET_CONDITION_GROUP = gql`
  mutation productsSetConditionGroup(
    $productIds: [String!]!
    $conditionGroupId: String
  ) {
    productsSetConditionGroup(
      productIds: $productIds
      conditionGroupId: $conditionGroupId
    )
  }
`;
