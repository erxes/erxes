import { commonTransactionFields } from "./queries";

const transactionsLink = `
  mutation accTransactionsLink($trIds: [String], $ptrId: String) {
    accTransactionsLink(trIds: $trIds, ptrId: $ptrId)
  }
`;

const transactionsCreate = `
  mutation accTransactionsCreate($trDocs: [TransactionInput]) {
    accTransactionsCreate(trDocs: $trDocs) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsUpdate = `
  mutation accTransactionsUpdate($parentId: String!, $trDocs: [TransactionInput]) {
    accTransactionsUpdate(parentId: $parentId, trDocs: $trDocs) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsRemove = `
  mutation accTransactionsRemove($parentId: String, $ptrId: String) {
    accTransactionsRemove(parentId: $parentId, ptrId: $ptrId) 
  }
`;

export default {
  transactionsCreate,
  transactionsUpdate,
  transactionsRemove,
  transactionsLink,
};
