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
      customerType
      customerDetail
      orders {
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
        syncedErkhet
        description
        isPre
        origin
        convertDealId
        returnInfo
      }
      totalOrders
      totalAmount
    }
  }
`;
export default {
  POS_ORDERS_BY_CUSTOMER,
};
