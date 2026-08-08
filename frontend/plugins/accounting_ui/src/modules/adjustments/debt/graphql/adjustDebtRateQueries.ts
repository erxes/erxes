import { gql } from '@apollo/client';

export const adjustDebtRateFields = `
  _id
  date
  mainCurrency
  currency
  customerType
  customerId
  description
  spotRate
  gainAccountId
  lossAccountId
  transactionId
  branchId
  departmentId
  createdBy
  modifiedBy
  createdAt
  updatedAt
`;

export const ADJUST_DEBT_RATE_QUERY = gql`
  query AdjustDebtRates(
    $limit: Int
    $cursor: String
    $orderBy: JSON
    $searchValue: String
  ) {
    adjustDebtRates(
      limit: $limit
      cursor: $cursor
      orderBy: $orderBy
      searchValue: $searchValue
    ) {
      list {
        ${adjustDebtRateFields}
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

export const ADJUST_DEBT_RATE_DETAIL_QUERY = gql`
  query AdjustDebtRateDetail($_id: String!) {
    adjustDebtRateDetail(_id: $_id) {
      ${adjustDebtRateFields}
      details {
        _id
        accountId
        mainBalance
        currencyBalance
        transactionId
        createdAt
        updatedAt
      }
    }
  }
`;
