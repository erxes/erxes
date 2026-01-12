import { gql } from '@apollo/client';

export const POS_ORDERS_BY_CUSTOMER = gql`
  query PosOrderCustomers(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    posOrderCustomers(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      customerDetail
      customerType
      orders {
        _id
        __typename
      }
      totalOrders
      totalAmount
      __typename
    }
    posOrderCustomersTotalCount(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    )
  }
`;
export default {
  POS_ORDERS_BY_CUSTOMER,
};
