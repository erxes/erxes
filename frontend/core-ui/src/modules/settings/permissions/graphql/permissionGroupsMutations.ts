import { gql } from '@apollo/client';

export const ADD_PERMISSION_GROUP_MUTATION = gql`
  mutation permissionGroupAdd(
    $name: String!
    $description: String
    $permissions: [PermissionInput]!
  ) {
    permissionGroupAdd(
      name: $name
      description: $description
      permissions: $permissions
    ) {
      _id
    }
  }
`;

export const EDIT_PERMISSION_GROUP_MUTATION = gql`
  mutation permissionGroupEdit(
    $_id: String!
    $name: String
    $description: String
    $permissions: [PermissionInput]
  ) {
    permissionGroupEdit(
      _id: $_id
      name: $name
      description: $description
      permissions: $permissions
    ) {
      _id
    }
  }
`;

export const REMOVE_PERMISSION_GROUP_MUTATION = gql`
  mutation permissionGroupRemove($_id: String!) {
    permissionGroupRemove(_id: $_id)
  }
`;

export const RESET_PERMISSION_GROUP_TO_TEMPLATE_MUTATION = gql`
  mutation permissionGroupResetToTemplate($_id: String!) {
    permissionGroupResetToTemplate(_id: $_id) {
      _id
    }
  }
`;

export const UPDATE_USER_PERMISSION_GROUPS_MUTATION = gql`
  mutation UserUpdatePermissionGroups($userId: String!, $groupIds: [String]!) {
    userUpdatePermissionGroups(userId: $userId, groupIds: $groupIds) {
      _id
    }
  }
`;

export const UPDATE_USERS_PERMISSION_GROUPS_MUTATION = gql`
  mutation UsersUpdatePermissionGroups(
    $userIds: [String]!
    $groupIds: [String]!
  ) {
    usersUpdatePermissionGroups(userIds: $userIds, groupIds: $groupIds)
  }
`;

export const MOVE_PERMISSION_GROUP_MEMBERS_MUTATION = gql`
  mutation permissionGroupMoveMembers(
    $fromGroupId: String!
    $toGroupId: String!
    $userIds: [String]
    $excludeUserIds: [String]
  ) {
    permissionGroupMoveMembers(
      fromGroupId: $fromGroupId
      toGroupId: $toGroupId
      userIds: $userIds
      excludeUserIds: $excludeUserIds
    )
  }
`;
