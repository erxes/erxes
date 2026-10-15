import { gql } from '~/gql';

export const ADJUST_CLOSING_CANCEL = gql(`
mutation accountingAdjustClosingCancel($adjustId: String!) {
  adjustClosingCancel(adjustId: $adjustId) {
    _id
    createdAt
    createdBy
    updatedAt
    modifiedBy
    status
    date
    beginDate
    description
    integrateAccountId
    periodGLAccountId
    earningAccountId
    taxPayableAccountId
  }
}
`);
