import { gql } from '@apollo/client';
import { adjustFundRateFields } from './adjustFundRateQueries';

export const ADJUST_FUND_RATE_RUN = gql`
  mutation AdjustFundRateRun($_id: String!) {
    adjustFundRateRun(_id: $_id) {
      ${adjustFundRateFields}
      details {
        _id
        accountId
        accountCode
        accountName
        accountCurrency
        mainBalance
        currencyBalance
        diff
        transactionId
        createdAt
        updatedAt
      }
    }
  }
`;
