import { gql } from '@apollo/client';

export const LOYALTY_SCORE_PRODUCT_CATEGORIES_QUERY = gql`
  query productCategories(
    $status: String
    $brand: String
    $searchValue: String
  ) {
    productCategories(
      status: $status
      brand: $brand
      searchValue: $searchValue
    ) {
      _id
      name
      order
      code
      parentId
      scopeBrandIds
      description
      status
      meta
      attachment {
        name
        url
        type
        size
        __typename
      }
      isRoot
      productCount
      maskType
      mask
      isSimilarity
      similarities
      __typename
    }
  }
`;
