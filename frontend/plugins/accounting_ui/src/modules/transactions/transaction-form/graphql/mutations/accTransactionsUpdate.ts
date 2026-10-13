import { gql } from '~/gql';

export const ACC_TRANSACTIONS_UPDATE = gql(`
mutation accountingAccTransactionsUpdate($parentId: String!, $trDocs: [TransactionInput!]!) {
  accTransactionsUpdate(parentId: $parentId, trDocs: $trDocs) {
    _id
    parentId
  }
}
`);
