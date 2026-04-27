import { gql } from '@apollo/client';

export const checkPosOrdersQuery = gql`
  query posOrders(
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
    $posId: String
    $posToken: String
    $types: [String]
    $statuses: [String]
    $excludeStatuses: [String]
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
      posId: $posId
      posToken: $posToken
      types: $types
      statuses: $statuses
      excludeStatuses: $excludeStatuses
    ) {
      _id
      createdAt
      paidDate
      number
      totalAmount
      __typename
    }
    posOrdersTotalCount(
      search: $search
      paidStartDate: $paidStartDate
      paidEndDate: $paidEndDate
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      paidDate: $paidDate
      userId: $userId
      posId: $posId
      posToken: $posToken
      types: $types
      statuses: $statuses
      excludeStatuses: $excludeStatuses
    )
  }
`;
