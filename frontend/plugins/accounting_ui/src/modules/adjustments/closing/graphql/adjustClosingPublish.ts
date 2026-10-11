import { gql } from '~/gql';

export const ADJUST_CLOSING_PUBLISH = gql(`
mutation accountingAdjustClosingPublish($adjustId: String!) {
  adjustClosingPublish(adjustId: $adjustId) {
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
