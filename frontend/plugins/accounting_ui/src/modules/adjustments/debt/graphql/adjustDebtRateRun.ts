import { gql } from '@apollo/client';
import { adjustDebtRateFields } from './adjustDebtRateQueries';

const adjustDebtRateDetailFields = `
  ${adjustDebtRateFields}
  details {
    _id
    accountId
    accountCode
    accountName
    accountKind
    accountCurrency
    customerType
    customerId
    branchId
    departmentId
    mainBalance
    currencyBalance
    diff
    transactionId
    createdAt
    updatedAt
  }
`;

export const ADJUST_DEBT_RATE_CALCULATE = gql`
  mutation AdjustDebtRateCalculate($_id: String!) {
    adjustDebtRateCalculate(_id: $_id) {
      ${adjustDebtRateDetailFields}
    }
  }
`;

export const ADJUST_DEBT_RATE_DO_TRANSACTION = gql`
  mutation AdjustDebtRateDoTransaction($_id: String!) {
    adjustDebtRateDoTransaction(_id: $_id) {
      ${adjustDebtRateDetailFields}
    }
  }
`;
