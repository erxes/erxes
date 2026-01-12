import { gql } from '@apollo/client';

export const POS_ORDER_GROUP_SUMMARY = gql`
  query Query(
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
    $groupField: String
  ) {
    posOrdersGroupSummary(
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
      groupField: $groupField
    )
  }
`;

export default {
  POS_ORDER_GROUP_SUMMARY,
};
