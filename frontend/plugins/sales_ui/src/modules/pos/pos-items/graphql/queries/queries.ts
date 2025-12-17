import { gql } from '@apollo/client';

export const POS_ORDER_RECORDS_QUERY = gql`
  query PosOrderRecords(
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
    posOrderRecords(
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
      createdAt
      status
      paidDate
      dueDate
      number
      customerId
      customerType
      cashAmount
      mobileAmount
      paidAmounts
      totalAmount
      finalAmount
      shouldPrintEbarimt
      printedEbarimt
      billType
      billId
      registerNumber
      oldBillId
      type
      userId
      items
      posToken
      posName
      branchId
      departmentId
      subBranchId
      branch
      department
      subBranch
      user {
        _id
        email
        __typename
      }
      customer {
        _id
        code
        primaryPhone
        firstName
        primaryEmail
        lastName
        __typename
      }
      syncedErkhet
      description
      isPre
      origin
      convertDealId
      returnInfo
    }
  }
`;

export default {
  POS_ORDER_RECORDS_QUERY,
};
