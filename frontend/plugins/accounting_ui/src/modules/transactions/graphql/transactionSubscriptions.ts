import { gql } from '@apollo/client';

export const ACCOUNTING_TRANSACTION_CHANGED = gql`
  subscription AccountingTransactionChanged($parentId: String) {
    accountingTransactionChanged(parentId: $parentId)
  }
`;

export default {
  ACCOUNTING_TRANSACTION_CHANGED,
};
