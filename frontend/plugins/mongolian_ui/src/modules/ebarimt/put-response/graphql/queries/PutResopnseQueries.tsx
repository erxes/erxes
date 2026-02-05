import { gql } from '@apollo/client';
const putResponses = gql`
  query PutResponses(
    $search: String
    $contentType: String
    $contentId: String
    $billType: String
    $billIdRule: String
    $isLast: String
    $orderNumber: String
    $contractNumber: String
    $transactionNumber: String
    $dealName: String
    $pipelineId: String
    $stageId: String
    $createdEndDate: Date
    $paidDate: String
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $aggregationPipeline: [JSON]
    $createdStartDate: Date
  ) {
    putResponses(
      search: $search
      contentType: $contentType
      contentId: $contentId
      billType: $billType
      billIdRule: $billIdRule
      isLast: $isLast
      orderNumber: $orderNumber
      contractNumber: $contractNumber
      transactionNumber: $transactionNumber
      dealName: $dealName
      pipelineId: $pipelineId
      stageId: $stageId
      createdEndDate: $createdEndDate
      paidDate: $paidDate
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      aggregationPipeline: $aggregationPipeline
      createdStartDate: $createdStartDate
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
