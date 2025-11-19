import { gql } from '@apollo/client';

export const POS_ORDER_BY_SUBSCRIPTION = gql`
  query PosOrderBySubscriptions(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $customerId: String
    $userId: String
    $companyId: String
    $status: String
    $closeFrom: String
    $closeTo: String
  ) {
    posOrderBySubscriptions(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      customerId: $customerId
      userId: $userId
      companyId: $companyId
      status: $status
      closeFrom: $closeFrom
      closeTo: $closeTo
    ) {
      _id
      customerId
      customerType
      customer
      status
      closeDate
      __typename
    }
    posOrderBySubscriptionsTotalCount(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      customerId: $customerId
      userId: $userId
      companyId: $companyId
      status: $status
      closeFrom: $closeFrom
      closeTo: $closeTo
    )
  }
`;
export default {
  POS_ORDER_BY_SUBSCRIPTION,
};
