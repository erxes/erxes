import gql from 'graphql-tag';

export const GET_SUB_PRODUCT = gql`
  query Products(
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
