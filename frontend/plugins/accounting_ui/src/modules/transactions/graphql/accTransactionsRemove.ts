import { gql } from '~/gql';

export const ACC_TRANSACTIONS_REMOVE = gql(`
mutation accountingAccTransactionsRemove($parentId: String, $ptrId: String) {
  accTransactionsRemove(parentId: $parentId, ptrId: $ptrId)
}
`);
