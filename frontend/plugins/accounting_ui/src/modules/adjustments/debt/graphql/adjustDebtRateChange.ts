import { gql } from '@apollo/client';
import { adjustDebtRateFields } from './adjustDebtRateQueries';

const adjDebtRateChangeParamDefs = `
  $_id: String!
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

const adjDebtRateChangeParams = `
  _id: $_id
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

export const ADJUST_DEBT_RATE_CHANGE = gql`
  mutation AdjustDebtRateChange(${adjDebtRateChangeParamDefs}) {
    adjustDebtRatesEdit(${adjDebtRateChangeParams}) {
      ${adjustDebtRateFields}
    }
  }
`;

export const ADJUST_DEBT_RATE_REMOVE = gql`
  mutation AdjustDebtRateRemove($adjustDebtRateIds: [String!]!) {
    adjustDebtRatesRemove(adjustDebtRateIds: $adjustDebtRateIds)
  }
`;
