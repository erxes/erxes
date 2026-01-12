import { gql } from '@apollo/client';

export const GET_EXCLUDE_PRODUCTS = gql`
  query products(
    $type: String
    $ids: [String]
    $page: Int
    $perPage: Int
    $status: String
  ) {
    products(
      type: $type
      ids: $ids
      page: $page
      perPage: $perPage
      status: $status
    ) {
      _id
      name
      type
    }
  }
`;
