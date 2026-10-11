import { gql } from '~/gql';

export const ACCOUNTING_ADJUST_FIXED_ASSET_CHANGED = gql(`
subscription AccountingAdjustFixedAssetChanged($adjustId: String!) {
  accountingAdjustFixedAssetChanged(adjustId: $adjustId) {
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
