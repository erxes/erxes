import { gql } from '@apollo/client';
import { adjustFundRateFields } from './adjustFundRateQueries';

const adjFundRateInputParamDefs = `
  $mainCurrency: String!
  $currency: String!
  $spotRate: Float!
  $date: Date!
  $description: String
  $gainAccountId: String!
  $lossAccountId: String!
`;

const adjFundRateInputParams = `
  mainCurrency: $mainCurrency
  currency: $currency
  spotRate: $spotRate
  date: $date
  description: $description
  gainAccountId: $gainAccountId
  lossAccountId: $lossAccountId
`;

export const ADJUST_FUND_RATE_ADD = gql`
  mutation AdjustFundRateAdd(${adjFundRateInputParamDefs}) {
    adjustFundRateAdd(${adjFundRateInputParams}) {
      ${adjustFundRateFields}
    }
  }
`;
