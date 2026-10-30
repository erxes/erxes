import { gql } from '~/gql';

export const SALES_CONTACT_POS_ORDERS = gql(`
  query salesContactPosOrders(
    $customerId: String
    $customerType: String
    $perPage: Int
  ) {
    posOrders(
      customerId: $customerId
      customerType: $customerType
      perPage: $perPage
    ) {
      _id
      number
      paidDate
      createdAt
      totalAmount
    }
  }
`);
