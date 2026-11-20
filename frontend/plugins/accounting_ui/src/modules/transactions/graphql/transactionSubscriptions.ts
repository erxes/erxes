import { gql } from '~/gql';

export const ACCOUNTING_TRANSACTION_CHANGED = gql(`
subscription AccountingTransactionChanged($parentId: String) {
  accountingTransactionChanged(parentId: $parentId)
}
`);

export const ACCOUNTING_TRANSACTIONS_LIST_CHANGED = gql(`
subscription accountingTransactionsListChanged($filter: JSON) {
  accountingTransactionsListChanged(filter: $filter) {
    trIds
    hasMore
    totalCount
    list {
      ...AccountingTransactionListFields
    }
  }
}
`);

export const ACCOUNTING_TR_RECORDS_LIST_CHANGED = gql(`
subscription accountingTrRecordsListChanged($filter: JSON) {
  accountingTrRecordsListChanged(filter: $filter) {
    trIds
    hasMore
    totalCount
    list {
      ...AccountingTrRecordListFields
    }
  }
}
`);
