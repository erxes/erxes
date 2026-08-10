import { gql } from '@apollo/client';
import { adjustFundRateDetailFields } from './adjustFundRateQueries';

export const ACCOUNTING_ADJUST_FUND_RATE_CHANGED = gql`
  subscription AccountingAdjustFundRateChanged($adjustId: String!) {
    accountingAdjustFundRateChanged(adjustId: $adjustId) {
      ${adjustFundRateDetailFields}
    }
  }
`;

export default {
  ACCOUNTING_ADJUST_FUND_RATE_CHANGED,
};
