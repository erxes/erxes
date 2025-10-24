import { gql } from '@apollo/client';

export const POS_ORDER_RECORDS_QUERY = gql`
  query posOrderRecords(
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
      types: $types
      statuses: $statuses
      excludeStatuses: $excludeStatuses
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
      branchId
      departmentId
      branch
      department
      syncedErkhet
      description
      isPre
      posName
      origin
      user {
        _id
        email
        __typename
      }
      convertDealId
      returnInfo
      customer {
        _id
        code
        primaryPhone
        firstName
        primaryEmail
        lastName
        __typename
      }
      __typename
    }
  }
`;

export default {
  POS_ORDER_RECORDS_QUERY,
};
