import { gql } from '~/gql';

export const ADJUST_FIXED_ASSET_ADD = gql(`
mutation accountingAdjustFixedAssetAdd($date: Date, $description: String, $beginDate: Date, $successDate: Date, $checkedAt: Date) {
  adjustFixedAssetAdd(
    date: $date
    description: $description
    beginDate: $beginDate
    successDate: $successDate
    checkedAt: $checkedAt
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

export const ADJUST_FIXED_ASSET_REMOVE = gql(`
mutation accountingAdjustFixedAssetRemove($adjustId: String!) {
  adjustFixedAssetRemove(adjustId: $adjustId)
}
`);

export const ADJUST_FIXED_ASSET_RUN = gql(`
mutation accountingAdjustFixedAssetRun($adjustId: String!) {
  adjustFixedAssetRun(adjustId: $adjustId) {
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
