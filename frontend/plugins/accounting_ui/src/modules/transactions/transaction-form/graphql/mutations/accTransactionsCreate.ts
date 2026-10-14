import { gql } from '~/gql';

export const ACC_TRANSACTIONS_CREATE = gql(`
mutation accountingAccTransactionsCreate($trDocs: [TransactionInput!]!) {
  accTransactionsCreate(trDocs: $trDocs) {
    _id
    parentId
  }
}
`);
