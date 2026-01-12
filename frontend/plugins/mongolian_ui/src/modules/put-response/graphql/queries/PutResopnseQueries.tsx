import { gql } from '@apollo/client';
const putResponses = gql`
  query PutResponses(
    $search: String
    $contentType: String
    $contentId: String
    $success: String
    $billType: String
    $billIdRule: String
    $isLast: String
    $orderNumber: String
    $contractNumber: String
    $transactionNumber: String
    $dealName: String
    $pipelineId: String
    $stageId: String
    $createdStartDate: Date
    $createdEndDate: Date
    $paidDate: String
    $sortMode: String
  ) {
    putResponses(
      search: $search
      contentType: $contentType
      contentId: $contentId
      success: $success
      billType: $billType
      billIdRule: $billIdRule
      isLast: $isLast
      orderNumber: $orderNumber
      contractNumber: $contractNumber
      transactionNumber: $transactionNumber
      dealName: $dealName
      pipelineId: $pipelineId
      stageId: $stageId
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      paidDate: $paidDate
      sortMode: $sortMode
    ) {
      list {
        _id
        number
        contentType
        contentId
        totalAmount
        totalVAT
        totalCityTax
        districtCode
        branchNo
        merchantTin
        posNo
        customerTin
        customerName
        consumerNo
        type
        inactiveId
        invoiceId
        reportMonth
        data
        receipts
        payments
        easy
        getInformation
        sendInfo
        state
        createdAt
        modifiedAt
        userId
        id
        posId
        status
        message
        qrData
        lottery
        date
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const putResponseQueries = {
  putResponses,
};
