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
  $customerType: String
  $posId: String
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
  customerType: $customerType
  posId: $posId
`;

export const orderFields = `
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
