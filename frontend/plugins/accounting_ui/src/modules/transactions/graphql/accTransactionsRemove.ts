import { gql } from '@apollo/client';

export const ACC_TRANSACTIONS_REMOVE = gql`
  mutation AccTransactionsRemove($parentId: String, $ptrId: String) {
    accTransactionsRemove(parentId: $parentId, ptrId: $ptrId)
  }
`;
