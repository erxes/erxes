import { gql } from '~/gql';

export const ACCOUNTING_ADJUST_FUND_RATE_CHANGED = gql(`
subscription AccountingAdjustFundRateChanged($adjustId: String!) {
  accountingAdjustFundRateChanged(adjustId: $adjustId) {
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
