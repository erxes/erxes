import { gql } from '@apollo/client';

const adjustClosingFields = `
  _id
  status
  beginDate
  successDate
  checkedAt
  error
  warning
  taxImpactValue
  closePeriodTrId
  earningTrId
  taxPayableTrId
`;

export const ADJUST_CLOSING_CALCULATE = gql`
  mutation AccountingAdjustClosingCalculate($_id: String!) {
    adjustClosingCalculate(_id: $_id) {
      ${adjustClosingFields}
    }
  }
`;

export const ADJUST_CLOSING_DO_TRANSACTION = gql`
  mutation AccountingAdjustClosingDoTransaction($_id: String!) {
    adjustClosingDoTransaction(_id: $_id) {
      ${adjustClosingFields}
    }
  }
`;
