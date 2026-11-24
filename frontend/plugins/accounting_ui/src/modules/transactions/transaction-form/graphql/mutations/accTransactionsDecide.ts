import { gql } from '~/gql';

export const ACC_TRANSACTIONS_DECIDE = gql(`
mutation accountingAccTransactionsDecide($parentId: String!, $decision: AccountingTransactionDecision!) {
  accTransactionsDecide(parentId: $parentId, decision: $decision) {
    _id
    parentId
  }
}
`);

// The decline reason is an ordinary internal note on the transaction, the
// same record the activity tab's note input writes.
export const ACC_TRANSACTION_DECLINE_NOTE_ADD = gql(`
mutation accountingTransactionDeclineNoteAdd($contentType: String!, $contentTypeId: String, $content: String) {
  internalNotesAdd(contentType: $contentType, contentTypeId: $contentTypeId, content: $content) {
    _id
  }
}
`);
