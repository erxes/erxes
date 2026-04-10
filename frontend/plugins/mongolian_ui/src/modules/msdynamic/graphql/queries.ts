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

const syncMsdHistories = `
  query syncMsdHistories(
    ${commonHistoryParams}
  ) {
    syncMsdHistories (
      ${commonHistoryParamDefs}
    ) {
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
  posOrderDetail,
  msdCustomerRelations,
};
