import { gql } from '@apollo/client';

export const GET_EXCLUDE_CATEGORIES = gql`
  query productCategories(
    $ids: [String]
    $searchValue: String
    $status: String
    $perPage: Int
    $page: Int
    $brandIds: [String]
  ) {
    productCategories(
      ids: $ids
      searchValue: $searchValue
      status: $status
      perPage: $perPage
      page: $page
      brandIds: $brandIds
    ) {
      _id
      code
      name
      order
    }
  }
`;
