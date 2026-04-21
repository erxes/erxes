import { gql } from '@apollo/client';

export const POS_ORDER_DETAIL_QUERY = gql`
  query PosOrderDetail($id: String) {
    posOrderDetail(_id: $id) {
      customer {
        _id
        code
        primaryPhone
        firstName
        primaryEmail
        lastName
      }
      _id
      billId
      billType
      branch
      branchId
      cashAmount
      convertDealId
      createdAt
      customerId
      customerType
      deal
      dealLink
      deliveryInfo
      department
      departmentId
      description
      dueDate
      finalAmount
      isPre
      items
      mobileAmount
      number
      oldBillId
      origin
      paidAmounts
      paidDate
      posName
      posToken
      printedEbarimt
      putResponses
      registerNumber
      returnInfo
      shouldPrintEbarimt
      status
      subBranch
      subBranchId
      syncErkhetInfo
      syncedErkhet
      totalAmount
      type
      user {
        username
      }
    }
  }
`;
