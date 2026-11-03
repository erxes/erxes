import { gql } from '~/gql';

export const ADJUST_FIXED_ASSET_TRANSACTION = gql(`
mutation accountingAdjustFixedAssetTransaction($adjustId: String!, $expenseAccountId: String!) {
  adjustFixedAssetTransaction(
    adjustId: $adjustId
    expenseAccountId: $expenseAccountId
  ) {
    _id
    createdAt
    createdBy
    updatedAt
    modifiedBy
    date
    description
    status
    error
    warning
    beginDate
    successDate
    checkedAt
  }
}
`);
