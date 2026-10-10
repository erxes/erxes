import { gql } from '~/gql';

export const ADJUST_FUND_RATE_CALCULATE = gql(`
mutation AccountingAdjustFundRateCalculate($_id: String!) {
  adjustFundRateCalculate(_id: $_id) {
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
  }
}
`);

export const ADJUST_FUND_RATE_DO_TRANSACTION = gql(`
mutation AccountingAdjustFundRateDoTransaction($_id: String!) {
  adjustFundRateDoTransaction(_id: $_id) {
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
  }
}
`);
