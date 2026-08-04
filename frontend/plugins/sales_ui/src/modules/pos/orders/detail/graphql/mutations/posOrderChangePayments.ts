import { gql } from '@apollo/client';

export const POS_ORDER_CHANGE_PAYMENTS = gql`
  mutation PosOrderChangePayments(
    $id: String!
    $cashAmount: Float
    $mobileAmount: Float
    $paidAmounts: JSON
    $description: String
  ) {
    posOrderChangePayments(
      _id: $id
      cashAmount: $cashAmount
      mobileAmount: $mobileAmount
      paidAmounts: $paidAmounts
      description: $description
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
      syncedErkhet
      description
      isPre
      origin
      convertDealId
      returnInfo
    }
  }
`;
