import { gql } from '~/gql';

export const GET_ACCOUNT_PERMISSIONS = gql(`
query accountingAccountPermissions($userId: String, $minLvl: Int, $maxLvl: Int, $reads: [String], $writes: [String], $searchValue: String, $code: String, $name: String, $categoryId: String, $currency: String, $kind: String, $journal: String, $isTemp: Boolean, $isOutBalance: Boolean, $status: String, $cursor: String, $cursorMode: CURSOR_MODE, $direction: CURSOR_DIRECTION, $limit: Int) {
  accountPermissions(
    userId: $userId
    minLvl: $minLvl
    maxLvl: $maxLvl
    reads: $reads
    writes: $writes
    searchValue: $searchValue
    code: $code
    name: $name
    categoryId: $categoryId
    currency: $currency
    kind: $kind
    journal: $journal
    isTemp: $isTemp
    isOutBalance: $isOutBalance
    status: $status
    cursor: $cursor
    cursorMode: $cursorMode
    direction: $direction
    limit: $limit
  ) {
    list {
      _id
      userId
      accountId
      level
      read
      write
      createdAt
      updatedAt
      user {
        _id
        email
        details {
          fullName
          avatar
        }
      }
      account {
        _id
        code
        name
        categoryId
        currency
        kind
        journal
        isTemp
        isOutBalance
        status
      }
    }
    totalCount
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
