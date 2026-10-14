import { gql } from '~/gql';

export const ACCOUNTING_TRANSACTION_CHANGED = gql(`
subscription AccountingTransactionChanged($parentId: String) {
  accountingTransactionChanged(parentId: $parentId)
}
`);
