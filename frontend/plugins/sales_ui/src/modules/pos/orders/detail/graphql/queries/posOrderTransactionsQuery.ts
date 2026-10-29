import { gql } from '~/gql';

export const POS_ORDER_TRANSACTIONS = gql(`
  query PosOrderTransactions($contentType: String!, $contentId: String!) {
    accTransactionsByContent(
      contentType: $contentType
      contentId: $contentId
      page: 1
      perPage: 1
    ) {
      totalCount
      list {
        _id
        parentId
        ptrNumber
        number
      }
    }
  }
`);
