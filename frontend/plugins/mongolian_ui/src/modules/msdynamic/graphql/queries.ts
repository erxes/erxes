import { gql } from '~/gql';

const syncMsdHistories = gql(`
  query msdynamicSyncHistories(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $userId: String
    $startDate: Date
    $endDate: Date
    $contentType: String
    $contentId: String
    $searchConsume: String
    $searchSend: String
    $searchResponse: String
    $searchError: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
  ) {
    syncMsdHistories(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      userId: $userId
      startDate: $startDate
      endDate: $endDate
      contentType: $contentType
      contentId: $contentId
      searchConsume: $searchConsume
      searchSend: $searchSend
      searchResponse: $searchResponse
      searchError: $searchError
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
    ) {
      list {
        _id
        type
        contentType
        contentId
        createdAt
        createdBy
        consumeData
        consumeStr
        sendData
        sendStr
        responseData
        responseStr
        sendSales
        responseSales
        error
        content
        createdUser
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
`);

const posOrdersList = gql(`
  query msdynamicPosOrdersList(
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $search: String
    $posToken: String
    $posId: String
    $userId: String
    $paidStartDate: Date
    $paidEndDate: Date
    $createdStartDate: Date
    $createdEndDate: Date
    $brandId: String
  ) {
    posOrdersList(
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
      search: $search
      posToken: $posToken
      posId: $posId
      userId: $userId
      createdStartDate: $createdStartDate
      createdEndDate: $createdEndDate
      paidStartDate: $paidStartDate
      paidEndDate: $paidEndDate
      brandId: $brandId
    ) {
      list {
        _id
        number
        createdAt
        paidDate
        totalAmount
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

const posOrderDetail = gql(`
  query msdynamicPosOrderDetail($_id: String) {
    posOrderDetail(_id: $_id) {
      _id
      createdAt
      status
      paidDate
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
      syncedErkhet
      posName
      origin
      user {
        _id
        email
      }
      convertDealId
      customer {
        _id
        code
        firstName
        lastName
        primaryEmail
        primaryPhone
      }
      syncErkhetInfo
      putResponses
      deliveryInfo
      deal
      dealLink
    }
  }
`);

export default {
  syncMsdHistories,
  posOrdersList,
  posOrderDetail,
};
