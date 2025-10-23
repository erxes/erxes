import { gql } from '@apollo/client';
const POS_ORDERS_QUERY = gql`
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
    $customerId: String
    $customerType: String
    $posId: String
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
      __typename
    }
  }
`;

export const POS_ORDER_COMMON_FIELDS = `
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
  __typename
`;

export const POS_ORDER_PARAM_DEFS = `
  $page: Int
  $perPage: Int
`;

export const POS_ORDER_PARAMS = `
  page: $page
  perPage: $perPage
`;

export const POS_ORDERS_LIST = gql`
  query posOrders(${POS_ORDER_PARAM_DEFS}
   $sortField: String
    $sortDirection: Int) {
    posOrders(${POS_ORDER_PARAMS}     sortField: $sortField
      sortDirection: $sortDirection) {
      ${POS_ORDER_COMMON_FIELDS}
    }
  }
`;

export const POS_ORDER_DETAIL = gql`
  query posOrderDetail($_id: String!,
    $sortField: String
    $sortDirection: Int) {
    posOrderDetail(_id: $_id,
      sortField: $sortField
      sortDirection: $sortDirection) {
      ${POS_ORDER_COMMON_FIELDS}
      productDetails
    }
  }
`;

export const POS_ORDERS = gql`
  query posOrders(${POS_ORDER_PARAM_DEFS}
      $sortField: String
    $sortDirection: Int) {
    posOrders(${POS_ORDER_PARAMS}     sortField: $sortField
      sortDirection: $sortDirection) {
      ${POS_ORDER_COMMON_FIELDS}
    }
  }
`;

export default {
  POS_ORDERS_LIST,
  POS_ORDER_DETAIL,
  POS_ORDERS,
  POS_ORDERS_QUERY,
};
