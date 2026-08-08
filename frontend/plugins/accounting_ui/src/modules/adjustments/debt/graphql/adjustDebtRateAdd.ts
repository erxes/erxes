import { gql } from '@apollo/client';
import { adjustDebtRateFields } from './adjustDebtRateQueries';

const adjDebtRateInputParamDefs = `
  $mainCurrency: String!
  $currency: String!
  $spotRate: Float!
  $date: Date!
  $customerType: String
  $customerId: String
  $description: String
  $gainAccountId: String!
  $lossAccountId: String!
  $branchId: String
  $departmentId: String
`;

const adjDebtRateInputParams = `
  mainCurrency: $mainCurrency
  currency: $currency
  spotRate: $spotRate
  date: $date
  customerType: $customerType
  customerId: $customerId
  description: $description
  gainAccountId: $gainAccountId
  lossAccountId: $lossAccountId
  branchId: $branchId
  departmentId: $departmentId
`;

export const ADJUST_DEBT_RATE_ADD = gql`
  mutation AdjustDebtRateAdd(${adjDebtRateInputParamDefs}) {
    adjustDebtRatesAdd(${adjDebtRateInputParams}) {
      ${adjustDebtRateFields}
    }
  }
`;
