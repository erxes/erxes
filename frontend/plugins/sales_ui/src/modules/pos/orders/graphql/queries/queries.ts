import { gql } from '@apollo/client';
const POS_ORDERS_QUERY = gql`
  query PosOrders(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $search: String
    $paidStartDate: Date
    $paidEndDate: Date
    $createdStartDate: Date
    $createdEndDate: Date
    $paidDate: String
    $userId: String
    $customerId: String
    $customerType: String
    $posId: String
    $posToken: String
    $types: [String]
    $statuses: [String]
    $excludeStatuses: [String]
    $hasPaidDate: Boolean
    $brandId: String
  ) {
    posOrders(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      search: $search
      paidStartDate: $paidStartDate
      paidEndDate: $paidEndDate
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      paidDate: $paidDate
      userId: $userId
      customerId: $customerId
      customerType: $customerType
      posId: $posId
      posToken: $posToken
      types: $types
      statuses: $statuses
      excludeStatuses: $excludeStatuses
      hasPaidDate: $hasPaidDate
      brandId: $brandId
    ) {
      _id
      billType
      branchId
      cashAmount
      createdAt
      customerType
      finalAmount
      items
      mobileAmount
      number
      paidAmounts
      paidDate
      posName
      posToken
      status
      totalAmount
      type
      user {
        username
        status
      }
    }
  }
`;

export default {
  POS_ORDERS_QUERY,
};
