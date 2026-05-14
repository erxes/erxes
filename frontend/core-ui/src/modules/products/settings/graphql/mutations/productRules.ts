import { gql } from '@apollo/client';

export const PRODUCT_RULES_ADD = gql`
  mutation productRulesAdd(
    $name: String!
    $unitPrice: Float!
    $bundleId: String
    $categoryIds: [String]
    $excludeCategoryIds: [String]
    $productIds: [String]
    $excludeProductIds: [String]
    $tagIds: [String]
    $excludeTagIds: [String]
  ) {
    productRulesAdd(
      name: $name
      unitPrice: $unitPrice
      bundleId: $bundleId
      categoryIds: $categoryIds
      excludeCategoryIds: $excludeCategoryIds
      productIds: $productIds
      excludeProductIds: $excludeProductIds
      tagIds: $tagIds
      excludeTagIds: $excludeTagIds
    ) {
      _id
      __typename
    }
  }
`;

export const PRODUCT_RULES_EDIT = gql`
  mutation productRulesEdit(
    $id: String!
    $name: String!
    $unitPrice: Float!
    $bundleId: String
    $categoryIds: [String]
    $excludeCategoryIds: [String]
    $productIds: [String]
    $excludeProductIds: [String]
    $tagIds: [String]
    $excludeTagIds: [String]
  ) {
    productRulesEdit(
      _id: $id
      name: $name
      unitPrice: $unitPrice
      bundleId: $bundleId
      categoryIds: $categoryIds
      excludeCategoryIds: $excludeCategoryIds
      productIds: $productIds
      excludeProductIds: $excludeProductIds
      tagIds: $tagIds
      excludeTagIds: $excludeTagIds
    ) {
      _id
      __typename
    }
  }
`;

export const PRODUCT_RULES_REMOVE = gql`
  mutation productRulesRemove($_ids: [String]!) {
    productRulesRemove(_ids: $_ids)
  }
`;
