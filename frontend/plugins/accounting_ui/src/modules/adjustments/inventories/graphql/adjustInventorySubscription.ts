import { gql } from '~/gql';

export const ACCOUNTING_ADJUST_INVENTORY_CHANGED = gql(`
subscription AccountingAdjustInventoryChanged($adjustId: String!) {
  accountingAdjustInventoryChanged(adjustId: $adjustId) {
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
