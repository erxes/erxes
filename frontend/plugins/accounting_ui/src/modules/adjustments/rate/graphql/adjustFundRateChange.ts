import { gql } from '~/gql';

export const ADJUST_FUND_RATE_CHANGE = gql(`
mutation AccountingAdjustFundRateChange($_id: String!, $mainCurrency: String, $currency: String, $spotRate: Float, $date: Date, $description: String, $gainAccountId: String, $lossAccountId: String) {
  adjustFundRateChange(
    _id: $_id
    mainCurrency: $mainCurrency
    currency: $currency
    spotRate: $spotRate
    date: $date
    description: $description
    gainAccountId: $gainAccountId
    lossAccountId: $lossAccountId
  ) {
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
  }
}
`);
