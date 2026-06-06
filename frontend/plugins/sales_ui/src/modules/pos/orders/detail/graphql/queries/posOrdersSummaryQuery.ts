import { gql } from '@apollo/client';

export const POS_ORDERS_SUMMARY_QUERY = gql`
  query posOrdersSummary(
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
    $types: [String]
    $statuses: [String]
    $excludeStatuses: [String]
  ) {
    posOrdersSummary(
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
      types: $types
      statuses: $statuses
      excludeStatuses: $excludeStatuses
    )
  }
`;
