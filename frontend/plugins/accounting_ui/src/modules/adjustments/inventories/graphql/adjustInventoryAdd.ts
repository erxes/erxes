import { gql } from '~/gql';

export const ADJUST_INVENTORY_ADD = gql(`
mutation accountingAdjustInventoryAdd($date: Date, $description: String, $beginDate: Date, $successDate: Date, $checkedAt: Date) {
  adjustInventoryAdd(
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
