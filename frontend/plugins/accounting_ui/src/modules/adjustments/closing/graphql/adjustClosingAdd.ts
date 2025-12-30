import { gql } from '@apollo/client';
import { adjustClosingFields } from './adjustClosingQueries';

const adjClosingInputParamDefs = `
  $status: String
  $date: Date
  $description: String
  $beginDate: Date
  $integrateAccountId: String
  $periodGLAccountId: String
  $earningAccountId: String
  $taxPayableaccountId: String
`;

const adjClosingInputParams = `
  status: $status
  date: $date
  description: $description
  beginDate: $beginDate
  integrateAccountId: $integrateAccountId
  periodGLAccountId: $periodGLAccountId
  earningAccountId: $earningAccountId
  taxPayableaccountId: $taxPayableaccountId
`;

export const ADJUST_CLOSING_ADD = gql`
  mutation AdjustClosingAdd(${adjClosingInputParamDefs}) {
    adjustClosingAdd(${adjClosingInputParams}) {
      ${adjustClosingFields}
    }
  }
`;
