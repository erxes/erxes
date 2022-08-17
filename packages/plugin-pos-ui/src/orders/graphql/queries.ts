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
      deliveryInfo
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

const productCategories = productQueries.productCategories;

export default {
  posOrders,
  posOrdersSummary,
  posOrderDetail,
  posProducts,
  productCategories
};
