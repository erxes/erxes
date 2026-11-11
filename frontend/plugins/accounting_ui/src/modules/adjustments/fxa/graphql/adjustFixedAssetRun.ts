import { gql } from '~/gql';

export const ADJUST_FIXED_ASSET_RUN = gql(`
mutation accountingAdjustFixedAssetRun($adjustId: String!, $taxRate: Float) {
  adjustFixedAssetRun(adjustId: $adjustId, taxRate: $taxRate) {
    _id
    createdAt
    createdBy
    updatedAt
    modifiedBy
    date
    description
    taxRate
    status
    error
    warning
    beginDate
    successDate
    checkedAt
  }
}
`);
