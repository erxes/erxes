import { gql } from '@apollo/client';

export const POS_CUSTOMERS_QUERY = gql`
  query PoscCustomers(
    $searchValue: String!
    $type: String
    $perPage: Int
    $page: Int
  ) {
    poscCustomers(
      searchValue: $searchValue
      type: $type
      perPage: $perPage
      page: $page
    ) {
      _id
      code
      primaryPhone
      primaryEmail
      firstName
      lastName
      primaryAddress
      addresses
    }
  }
`;
