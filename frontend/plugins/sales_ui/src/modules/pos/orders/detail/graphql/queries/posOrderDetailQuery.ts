import { gql } from '@apollo/client';

export const POS_ORDER_DETAIL_QUERY = gql`
  query PosOrderDetail($id: String) {
    posOrderDetail(_id: $id) {
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
      syncErkhetInfo
      putResponses
      deliveryInfo
      deal
      dealLink
    }
  }
`;
