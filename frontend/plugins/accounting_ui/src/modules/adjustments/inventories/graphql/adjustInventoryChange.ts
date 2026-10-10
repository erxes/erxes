import { gql } from '~/gql';

export const ADJUST_INVENTORY_PUBLISH = gql(`
mutation accountingAdjustInventoryPublish($adjustId: String!) {
  adjustInventoryPublish(adjustId: $adjustId) {
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

export const ADJUST_INVENTORY_CANCEL = gql(`
mutation accountingAdjustInventoryCancel($adjustId: String!) {
  adjustInventoryCancel(adjustId: $adjustId) {
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

export const ADJUST_INVENTORY_RUN = gql(`
mutation accountingAdjustInventoryRun($adjustId: String!) {
  adjustInventoryRun(adjustId: $adjustId) {
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
