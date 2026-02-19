import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_PERMISSIONS = gql`
  query Permissions(
    $module: String
    $action: String
    $userId: String
    $groupId: String
    $allowed: Boolean
    $orderBy: JSON
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    permissions(
      module: $module
      action: $action
      userId: $userId
      groupId: $groupId
      allowed: $allowed
      orderBy: $orderBy
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        action
        allowed
        module
        userId
        groupId
        user {
          _id
          email
        }
        group {
          _id
          name
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_PERMISSION_MODULES = gql`
  query PermissionModules {
    permissionModules {
      actions {
        description
        module
        name
      }
      description
      name
    }
  }
`;

export const GET_PERMISSION_ACTIONS = gql`
  query PermissionActions {
    permissionActions {
      name
      description
      module
    }
  }
`;

export const CURRENT_USER_PERMISSIONS = gql`
  query CurrentUserPermissions {
    currentUserPermissions {
      module
      actions
      scope
    }
  }
`;
