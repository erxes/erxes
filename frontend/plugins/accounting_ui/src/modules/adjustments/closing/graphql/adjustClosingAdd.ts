import { gql } from '~/gql';

export const ADJUST_CLOSING_ADD = gql(`
mutation accountingAdjustClosingAdd($date: Date!, $beginDate: Date, $description: String, $integrateAccountId: String!, $periodGLAccountId: String!, $earningAccountId: String!, $taxPayableAccountId: String!) {
  adjustClosingAdd(
    date: $date
    beginDate: $beginDate
    description: $description
    integrateAccountId: $integrateAccountId
    periodGLAccountId: $periodGLAccountId
    earningAccountId: $earningAccountId
    taxPayableAccountId: $taxPayableAccountId
  ) {
    _id
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
