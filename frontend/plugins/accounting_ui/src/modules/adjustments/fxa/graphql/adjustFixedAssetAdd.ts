import { gql } from '~/gql';

export const ADJUST_FIXED_ASSET_ADD = gql(`
mutation accountingAdjustFixedAssetAdd($taxRate: Float!, $date: Date, $description: String, $beginDate: Date, $successDate: Date, $checkedAt: Date) {
  adjustFixedAssetAdd(
    taxRate: $taxRate
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
