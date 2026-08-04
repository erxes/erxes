import { gql } from '@apollo/client';

export const VOUCHER_CUSTOMERS_QUERY = gql`
  query VoucherCustomers(
    $searchValue: String!
    $type: String
    $perPage: Int
    $page: Int
  ) {
    voucherCustomers(
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
