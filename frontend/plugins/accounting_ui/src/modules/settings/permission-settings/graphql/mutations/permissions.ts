import { gql } from '~/gql';

export const SET_ACCOUNT_PERMISSIONS = gql(`
mutation accountingSetAccountPermissions($accountIds: [String!]!, $userId: String!, $level: Int, $read: String, $write: String) {
  setAccountPermissions(
    accountIds: $accountIds
    userId: $userId
    level: $level
    read: $read
    write: $write
  ) {
    accountId
    status
  }
}
`);
