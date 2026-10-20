import { gql } from '~/gql';

export const GET_EBARIMT_PRODUCT_RULES = gql(`
  query mongolianEbarimtProductRules(
    $searchValue: String
    $productId: String
    $kind: String
    $taxCode: String
    $taxType: String
    $taxPercent: Float
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    ebarimtProductRules(
      searchValue: $searchValue
      productId: $productId
      kind: $kind
      taxCode: $taxCode
      taxType: $taxType
      taxPercent: $taxPercent
      limit: $limit
      cursor: $cursor
      direction: $direction
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
`);
