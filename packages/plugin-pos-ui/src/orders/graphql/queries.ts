import { queries as productQueries } from '@erxes/ui-products/src/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';

const listParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
  $search: String
  $paidStartDate: Date
  $paidEndDate: Date
  $createdStartDate: Date
  $createdEndDate: Date
  $paidDate: String
  $userId: String
  $customerId: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
  search: $search
  paidStartDate: $paidStartDate
  paidEndDate: $paidEndDate
  createdStartDate: $createdStartDate
  createdEndDate: $createdEndDate
  paidDate: $paidDate
  userId: $userId
  customerId: $customerId
`;

export const orderFields = `
  _id
  createdAt
  status
  paidDate
  number
  customerId
  cardAmount
  cashAmount
  mobileAmount
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
  user {
    _id
    email
  }
  ${
    isEnabled('contacts')
      ? `
        customer {
          _id
          firstName
          lastName
          middleName
          primaryEmail
          primaryPhone
        }
      `
      : ``
  }

`;

const posOrders = `
  query posOrders(${listParamsDef}) {
    posOrders(${listParamsValue}) {
      ${orderFields}
    }
  }
`;

const posOrdersSummary = `
  query posOrdersSummary(${listParamsDef}) {
    posOrdersSummary(${listParamsValue})
  }
`;

const posOrderDetail = `
  query posOrderDetail($_id: String) {
    posOrderDetail(_id: $_id) {
      ${orderFields}
      putResponses
    }
  }
`;

const posProducts = `
  query posProducts(
    $categoryId: String,
    $searchValue: String,
    ${listParamsDef}
  ) {
    posProducts(
      categoryId: $categoryId,
      searchValue: $searchValue,
      ${listParamsValue}
    ) {
      products {
        _id
        name
        type
        code
        categoryId
        unitPrice
        category {
          _id
          code
          name
        }
        counts
        count
        amount
      }

      totalCount
    }
  }
`;
const commonParams = `
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
`;

const commonParamDefs = `
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
`;

const checkSyncOrdersTotalCount = `
  query dealsTotalCount (
    ${commonParams}
  ) {
    dealsTotalCount (
      ${commonParamDefs}
    )
  }
`;
const checkSyncOrders = `
  query orders (
    ${commonParams}
  ) {
    orders (
      ${commonParamDefs}
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
const productCategories = productQueries.productCategories;

export default {
  checkSyncOrdersTotalCount,
  checkSyncOrders,
  posOrders,
  posOrdersSummary,
  posOrderDetail,
  posProducts,
  productCategories
};
