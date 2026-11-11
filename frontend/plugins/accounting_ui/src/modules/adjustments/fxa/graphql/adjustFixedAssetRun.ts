import { gql } from '~/gql';

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
