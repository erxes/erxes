import { gql } from '@apollo/client';

export const GET_PRODUCT_CATEGORIES = gql`
  query productCategories(
    $ids: [String]
    $searchValue: String
    $status: String
    $brandIds: [String]
  ) {
    productCategories(
      ids: $ids
      searchValue: $searchValue
      status: $status
      brandIds: $brandIds
    ) {
      _id
      code
      name
      order
    }
  }
`;
