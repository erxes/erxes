import { gql } from '@apollo/client';

export const adjustFundRateFields = `
  _id
  date
  mainCurrency
  currency
  description
  spotRate
  gainAccountId
  lossAccountId
  transactionId
  status
  beginDate
  successDate
  checkedAt
  error
  warning
  createdBy
  modifiedBy
  createdAt
  updatedAt
`;

export const adjustFundRateDetailFields = `
  ${adjustFundRateFields}
  details {
    _id
    accountId
    accountCode
    accountName
    accountCurrency
    mainBalance
    currencyBalance
    diff
    transactionId
    branchId
    departmentId
    createdAt
    updatedAt
  }
`;

export const ADJUST_FUND_RATE_QUERY = gql`
  query AdjustFundRates(
    $limit: Int
    $cursor: String
    $orderBy: JSON
    $searchValue: String
  ) {
    adjustFundRates(
      limit: $limit
      cursor: $cursor
      orderBy: $orderBy
      searchValue: $searchValue
    ) {
      list {
        ${adjustFundRateFields}
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

export const ADJUST_FUND_RATE_DETAIL_QUERY = gql`
  query AdjustFundRateDetail($_id: String!) {
    adjustFundRateDetail(_id: $_id) {
      ${adjustFundRateDetailFields}
    }
  }
`;
