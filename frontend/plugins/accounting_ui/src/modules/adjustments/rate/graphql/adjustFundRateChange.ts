import { gql } from '@apollo/client';
import { adjustFundRateFields } from './adjustFundRateQueries';

const adjFundRateChangeParamDefs = `
  $_id: String!
  $mainCurrency: String
  $currency: String
  $spotRate: Float
  $date: Date
  $description: String
  $gainAccountId: String
  $lossAccountId: String
`;

const adjFundRateChangeParams = `
  _id: $_id
  mainCurrency: $mainCurrency
  currency: $currency
  spotRate: $spotRate
  date: $date
  description: $description
  gainAccountId: $gainAccountId
  lossAccountId: $lossAccountId
`;

export const ADJUST_FUND_RATE_CHANGE = gql`
  mutation AccountingAdjustFundRateChange(${adjFundRateChangeParamDefs}) {
    adjustFundRateChange(${adjFundRateChangeParams}) {
      ${adjustFundRateFields}
    }
  }
`;
