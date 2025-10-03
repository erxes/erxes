import { gql } from '@apollo/client';

export const ACC_TRANSACTIONS_CREATE = gql`
  mutation AccTransactionsCreate($trDocs: [TransactionInput]) {
    accTransactionsCreate(trDocs: $trDocs) {
      _id
      parentId
    }
  }
`;
