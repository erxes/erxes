import { gql } from '@apollo/client';

export const PRODUCT_CATEGORIES_QUERY = gql`
  query ProductCategories(
    $ids: [String]
    $parentId: String
    $withChild: Boolean
    $searchValue: String
    $status: String
    $meta: String
    $brandIds: [String]
  ) {
    productCategories(
      ids: $ids
      parentId: $parentId
      withChild: $withChild
      searchValue: $searchValue
      status: $status
      meta: $meta
      brandIds: $brandIds
    ) {
      _id
      name
      description
      meta
      parentId
      code
      order
      scopeBrandIds
      attachment {
        url
        name
        type
        size
        duration
      }
      status
      isRoot
      productCount
      maskType
      mask
      isSimilarity
      similarities
    }
  }
`;
