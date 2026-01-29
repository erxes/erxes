import { gql } from '@apollo/client';

export const EBARIMT_PRODUCT_RULES_QUERY = gql`
  query EbarimtProductRules(
    $searchValue: String
    $kind: String
    $productId: String
    $taxCode: String
    $taxType: String
    $taxPercent: Float
  ) {
    ebarimtProductRules(
      searchValue: $searchValue
      kind: $kind
      productId: $productId
      taxCode: $taxCode
      taxType: $taxType
      taxPercent: $taxPercent
    ) {
      list {
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
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
