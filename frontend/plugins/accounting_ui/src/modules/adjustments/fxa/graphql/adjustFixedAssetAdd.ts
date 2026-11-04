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
