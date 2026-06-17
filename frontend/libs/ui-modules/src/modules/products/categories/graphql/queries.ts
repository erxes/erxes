import { gql } from '@apollo/client';

export const productCategories = gql`
  query ProductCategories(
    $ids: [String]
    $searchValue: String
    $status: String
    $parentId: String
    $withChild: Boolean
  ) {
    productCategories(
      ids: $ids
      searchValue: $searchValue
      status: $status
      parentId: $parentId
      withChild: $withChild
    ) {
      _id
      parentId
      code
      name
      order
      productCount
    }
  }
`;
