import { gql } from '@apollo/client';

export const ADJUST_FUND_RATE_REMOVE = gql`
  mutation AdjustFundRateRemove($adjustFundRateIds: [String!]!) {
    adjustFundRateRemove(adjustFundRateIds: $adjustFundRateIds)
  }
`;
