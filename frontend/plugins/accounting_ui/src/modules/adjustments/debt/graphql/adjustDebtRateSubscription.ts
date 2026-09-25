import { gql } from '@apollo/client';

export const ACCOUNTING_ADJUST_DEBT_RATE_CHANGED = gql`
  subscription AccountingAdjustDebtRateChanged($adjustId: String!) {
    accountingAdjustDebtRateChanged(adjustId: $adjustId) {
      _id
      date
      mainCurrency
      currency
      customerType
      customerId
      description
      spotRate
      gainAccountId
      lossAccountId
      transactionId
      status
      beginDate
      successDate
      checkedAt
      error
      warning
      branchId
      departmentId
      createdBy
      modifiedBy
      createdAt
      updatedAt
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
    }
  }
`;
