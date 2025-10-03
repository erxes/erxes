import { gql } from '@apollo/client';

export const ADD_PERMISSIONS = gql`
  mutation PermissionsAdd(
    $module: String!
    $actions: [String!]!
    $allowed: Boolean
    $userIds: [String!]
    $groupIds: [String!]
  ) {
    permissionsAdd(
      module: $module
      actions: $actions
      allowed: $allowed
      userIds: $userIds
      groupIds: $groupIds
    ) {
      _id
      action
      allowed
      module
      cursor
      groupId
      userId
    }
  }
`;
