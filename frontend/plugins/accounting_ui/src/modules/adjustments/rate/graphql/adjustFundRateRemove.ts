import { gql } from '~/gql';

export const ADJUST_FUND_RATE_REMOVE = gql(`
mutation AccountingAdjustFundRateRemove($adjustFundRateIds: [String!]!) {
  adjustFundRateRemove(adjustFundRateIds: $adjustFundRateIds)
}
`);
