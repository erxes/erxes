const commonHistoryParams = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
  $userId: String,
  $startDate: Date,
  $endDate: Date,
  $contentType: String,
  $contentId: String,
  $searchConsume: String,
  $searchSend: String,
  $searchResponse: String,
  $searchError: String,
  $limit: Int,
  $cursor: String,
  $direction: CURSOR_DIRECTION,
  $orderBy: JSON,
`;

const commonHistoryParamDefs = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
  userId: $userId,
  startDate: $startDate,
  endDate: $endDate,
  contentType: $contentType,
  contentId: $contentId,
  searchConsume: $searchConsume,
  searchSend: $searchSend,
  searchResponse: $searchResponse,
  searchError: $searchError,
  limit: $limit,
  cursor: $cursor,
  direction: $direction,
  orderBy: $orderBy,
`;

const commonOrderParams = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int,
  $posToken: String,
  $search: String,
  $posId: String,
  $userId: String,
  $paidStartDate: Date,
  $paidEndDate: Date,
  $createdStartDate: Date,
  $createdEndDate: Date,
  $brandId: String,
`;

const commonOrderParamDefs = `
  page: $page,
  perPage: $perPage,
  sortField: $sortField,
  sortDirection: $sortDirection,
  posToken: $posToken,
  search: $search,
  posId: $posId,
  userId: $userId,
  createdStartDate: $createdStartDate,
  createdEndDate: $createdEndDate,
  paidStartDate: $paidStartDate,
  paidEndDate: $paidEndDate,
  brandId: $brandId
`;

const cursorOrderParams = `
  $limit: Int,
  $cursor: String,
  $direction: CURSOR_DIRECTION,
  $orderBy: JSON,
  $search: String,
  $posToken: String,
  $posId: String,
  $userId: String,
  $paidStartDate: Date,
  $paidEndDate: Date,
  $createdStartDate: Date,
  $createdEndDate: Date,
  $brandId: String,
`;

const cursorOrderParamDefs = `
  limit: $limit,
  cursor: $cursor,
  direction: $direction,
  orderBy: $orderBy,
  search: $search,
  posToken: $posToken,
  posId: $posId,
  userId: $userId,
  createdStartDate: $createdStartDate,
  createdEndDate: $createdEndDate,
  paidStartDate: $paidStartDate,
  paidEndDate: $paidEndDate,
  brandId: $brandId
`;

const syncMsdHistories = `
  query syncMsdHistories(
    ${commonHistoryParams}
  ) {
    syncMsdHistories (
      ${commonHistoryParamDefs}
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
`;

const syncMsdHistoriesCount = `
  query syncMsdHistoriesCount(
    ${commonHistoryParams}
  ) {
    syncMsdHistoriesCount (
      ${commonHistoryParamDefs}
    )
  }
`;

const dynamicConfigs = `
  query msdynamicConfigs {
    msdynamicConfigs {
      _id
      endPoint
      username
      password
    }
  }
`;

const configs = `
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

const checkSyncOrders = `
  query PosOrders(
    ${commonOrderParams}
  ) {
    posOrders (
      ${commonOrderParamDefs}
    ) {
      _id
      number
      createdAt
      paidDate
      totalAmount
    }
  }
`;

const checkSyncOrdersTotalCount = `
  query ordersTotalCount (
    ${commonOrderParams}
  ) {
    posOrdersTotalCount (
      ${commonOrderParamDefs}
    )
  }
`;

const posOrdersList = `
  query MsdynamicPosOrdersList(
    ${cursorOrderParams}
  ) {
    posOrdersList (
      ${cursorOrderParamDefs}
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
`;

const posOrderDetail = `
  query posOrderDetail($_id: String) {
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
`;

const msdCustomerRelations = `
  query msdCustomerRelations($customerId: String) {
    msdCustomerRelations(customerId: $customerId) {
      _id
      customerId
      brandId
      brand
      modifiedAt
      no
      response
    }
  }
`;

export default {
  syncMsdHistories,
  syncMsdHistoriesCount,
  dynamicConfigs,
  configs,
  checkSyncOrders,
  checkSyncOrdersTotalCount,
  posOrdersList,
  posOrderDetail,
  msdCustomerRelations,
};
