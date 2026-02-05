import { gql } from '@apollo/client';

export const GET_PERMISSION_DEFAULT_GROUPS = gql`
  query permissionDefaultGroups {
    permissionDefaultGroups {
      id
      name
      description
      plugin
      permissions {
        module
        actions
        scope
      }
    }
  }
`;

export const GET_PERMISSION_GROUPS = gql`
  query permissionGroups {
    permissionGroups {
      _id
      name
      description
      permissions {
        module
        actions
        scope
      }
    }
  }
`;

export const GET_PERMISSION_MODULES = gql`
  query permissionModules {
    permissionModules {
      name
      description
      plugin
      scopeField
      ownerFields
      actions {
        name
        description
        always
        disabled
      }
    }
  }
`;
