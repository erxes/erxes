// Settings

import { isEnabled } from '@erxes/ui/src/utils/core';

const configs = `
  query syncerkhetConfigsGetValue($code: String!) {
    syncerkhetConfigsGetValue(code: $code)
  }
`;

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

const commonDealParams = `
  $skip: Int,
  $limit: Int,
  $sortField: String,
  $sortDirection: Int,
  $userIds: [String],
  $pipelineId: String
  $stageId: String
  $stageChangedStartDate: Date
  $stageChangedEndDate: Date
  $noSkipArchive: Boolean
  $assignedUserIds: [String],
  $productIds: [String],
  $search: String
  $number: String
`;

const commonDealParamDefs = `
  skip: $skip,
  limit: $limit,
  sortField: $sortField
  sortDirection: $sortDirection
  userIds: $userIds
  pipelineId: $pipelineId
  stageId: $stageId
  stageChangedStartDate: $stageChangedStartDate
  stageChangedEndDate: $stageChangedEndDate
  noSkipArchive: $noSkipArchive
  assignedUserIds: $assignedUserIds,
  productIds: $productIds,
  search: $search,
  number: $number,
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
`;

const checkSyncDeals = `
  query deals (
    ${commonDealParams}
  ) {
    deals (
      ${commonDealParamDefs}
    ) {
      _id
      name
      amount
      assignedUsers
      modifiedAt
      number
      createdAt
      stageChangedDate
    }
  }
`;

const checkSyncDealsTotalCount = `
  query dealsTotalCount (
    ${commonDealParams}
  ) {
    dealsTotalCount (
      ${commonDealParamDefs}
    )
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
      ${
        isEnabled('contacts')
          ? `
        customer {
          _id
          code
          firstName
          lastName
          primaryEmail
          primaryPhone
        }
      `
          : ``
      }
      syncErkhetInfo
      putResponses
      deliveryInfo
      deal
      dealLink
    }
  }
`;

const syncHistories = `
  query syncHistories(
    ${commonHistoryParams}
  ) {
    syncHistories (
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
      error

      content
      createdUser
    }
  }
`;

const syncHistoriesCount = `
  query syncHistoriesCount(
    ${commonHistoryParams}
  ) {
    syncHistoriesCount (
      ${commonHistoryParamDefs}
    )
  }
`;

export default {
  configs,
  syncHistories,
  syncHistoriesCount,

  checkSyncDeals,
  checkSyncDealsTotalCount,
  checkSyncOrdersTotalCount,
  checkSyncOrders,

  posOrderDetail
};
