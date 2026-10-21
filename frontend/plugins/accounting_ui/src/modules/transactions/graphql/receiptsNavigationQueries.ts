import { gql } from '~/gql';

export const RECEIPTS_BRANCHES_QUERY = gql(`
query accountingReceiptsBranches($cursor: String, $direction: CURSOR_DIRECTION, $limit: Int) {
  branchesMain(cursor: $cursor, direction: $direction, limit: $limit) {
    list {
      _id
      title
      code
      parentId
      order
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`);

export const RECEIPTS_DEPARTMENTS_QUERY = gql(`
query accountingReceiptsDepartments($cursor: String, $direction: CURSOR_DIRECTION, $limit: Int) {
  departmentsMain(cursor: $cursor, direction: $direction, limit: $limit) {
    list {
      _id
      title
      code
      parentId
      order
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`);
