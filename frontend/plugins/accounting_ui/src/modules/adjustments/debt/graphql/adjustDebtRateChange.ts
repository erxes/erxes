import { gql } from '~/gql';

export const ADJUST_DEBT_RATE_CHANGE = gql(`
mutation AccountingAdjustDebtRateChange($_id: String!, $mainCurrency: String!, $currency: String!, $spotRate: Float!, $date: Date!, $customerType: String, $customerId: String, $description: String, $gainAccountId: String!, $lossAccountId: String!, $branchId: String, $departmentId: String) {
  adjustDebtRatesEdit(
    _id: $_id
    mainCurrency: $mainCurrency
    currency: $currency
    spotRate: $spotRate
    date: $date
    customerType: $customerType
    customerId: $customerId
    description: $description
    gainAccountId: $gainAccountId
    lossAccountId: $lossAccountId
    branchId: $branchId
    departmentId: $departmentId
  ) {
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
    status
    beginDate
    successDate
    checkedAt
    error
    warning
    branchId
    departmentId
    createdBy
    modifiedBy
    createdAt
    updatedAt
  }
}
`);

export const ADJUST_DEBT_RATE_REMOVE = gql(`
mutation AccountingAdjustDebtRateRemove($adjustDebtRateIds: [String!]!) {
  adjustDebtRatesRemove(adjustDebtRateIds: $adjustDebtRateIds)
}
`);
