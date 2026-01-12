import { gql } from '@apollo/client';

export const GET_ANOTHER_RULES_OF_PRODUCTS_ON_CITY_TAX = gql`
  query EbarimtProductRules(
    $searchValue: String
    $productId: String
    $kind: String
    $taxCode: String
    $taxType: String
  ) {
    ebarimtProductRules(
      searchValue: $searchValue
      productId: $productId
      kind: $kind
      taxCode: $taxCode
      taxType: $taxType
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
