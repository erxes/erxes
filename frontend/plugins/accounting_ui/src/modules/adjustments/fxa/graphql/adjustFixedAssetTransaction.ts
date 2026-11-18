import { gql } from '~/gql';

export const ADJUST_FIXED_ASSET_TRANSACTION = gql(`
mutation accountingAdjustFixedAssetTransaction($adjustId: String!, $expenseAccountId: String!, $taxExpenseAccountId: String) {
  adjustFixedAssetTransaction(
    adjustId: $adjustId
    expenseAccountId: $expenseAccountId
    taxExpenseAccountId: $taxExpenseAccountId
  ) {
    _id
    createdAt
    createdBy
    updatedAt
    modifiedBy
    date
    description
    expenseAccountId
    taxExpenseAccountId
    status
    error
    warning
    beginDate
    successDate
    checkedAt
  }
}
`);
