import { gql } from '@apollo/client';

export const ACC_TRANSACTIONS_UPDATE = gql`
  mutation AccTransactionsUpdate($parentId: String, $trDocs: [TransactionInput]) {
    accTransactionsUpdate(parentId: $parentId, trDocs: $trDocs) {
      _id
      parentId
    }
  }
`;
