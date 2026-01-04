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
  branchId
  departmentId
  createdBy
  modifiedBy
  createdAt
  updatedAt
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
      ${adjustFundRateFields}
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
