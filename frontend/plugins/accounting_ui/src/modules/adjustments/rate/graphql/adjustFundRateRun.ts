import { gql } from '@apollo/client';
import { adjustFundRateDetailFields } from './adjustFundRateQueries';

export const ADJUST_FUND_RATE_CALCULATE = gql`
  mutation AccountingAdjustFundRateCalculate($_id: String!) {
    adjustFundRateCalculate(_id: $_id) {
      ${adjustFundRateDetailFields}
    }
  }
`;

export const ADJUST_FUND_RATE_DO_TRANSACTION = gql`
  mutation AccountingAdjustFundRateDoTransaction($_id: String!) {
    adjustFundRateDoTransaction(_id: $_id) {
      ${adjustFundRateDetailFields}
    }
  }
`;
