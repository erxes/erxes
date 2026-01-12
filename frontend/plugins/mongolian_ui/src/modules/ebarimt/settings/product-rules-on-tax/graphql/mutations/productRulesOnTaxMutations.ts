import { gql } from '@apollo/client';

export const EBARIMT_PRODUCT_RULES_ON_TAX_ADD = gql`
  mutation EbarimtProductRuleCreate(
    $title: String
    $productIds: [String]
    $productCategoryIds: [String]
    $excludeCategoryIds: [String]
    $excludeProductIds: [String]
    $tagIds: [String]
    $excludeTagIds: [String]
    $kind: String
    $taxType: String
    $taxCode: String
    $taxPercent: Float
  ) {
    ebarimtProductRuleCreate(
      title: $title
      productIds: $productIds
      productCategoryIds: $productCategoryIds
      excludeCategoryIds: $excludeCategoryIds
      excludeProductIds: $excludeProductIds
      tagIds: $tagIds
      excludeTagIds: $excludeTagIds
      kind: $kind
      taxType: $taxType
      taxCode: $taxCode
      taxPercent: $taxPercent
    ) {
      _id
      createdAt
      modifiedAt
      title
      productIds
      productCategoryIds
      excludeCategoryIds
      excludeProductIds
      tagIds
      excludeTagIds
      kind
      taxType
      taxCode
      taxPercent
      __typename
    }
  }
`;

export const EBARIMT_PRODUCT_RULE_ON_TAX_EDIT = gql`
  mutation EbarimtProductRuleUpdate(
    $id: String
    $title: String
    $productIds: [String]
    $productCategoryIds: [String]
    $excludeCategoryIds: [String]
    $excludeProductIds: [String]
    $tagIds: [String]
    $excludeTagIds: [String]
    $kind: String
    $taxType: String
    $taxCode: String
    $taxPercent: Float
  ) {
    ebarimtProductRuleUpdate(
      _id: $id
      title: $title
      productIds: $productIds
      productCategoryIds: $productCategoryIds
      excludeCategoryIds: $excludeCategoryIds
      excludeProductIds: $excludeProductIds
      tagIds: $tagIds
      excludeTagIds: $excludeTagIds
      kind: $kind
      taxType: $taxType
      taxCode: $taxCode
      taxPercent: $taxPercent
    ) {
      _id
      createdAt
      modifiedAt
      title
      productIds
      productCategoryIds
      excludeCategoryIds
      excludeProductIds
      tagIds
      excludeTagIds
      kind
      taxType
      taxCode
      taxPercent
    }
  }
`;

export const EBARIMT_PRODUCT_RULE_ON_TAX_REMOVE = gql`
  mutation EbarimtProductRulesRemove($ids: [String]) {
    ebarimtProductRulesRemove(ids: $ids)
  }
`;
