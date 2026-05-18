import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const PERMISSION_DEFAULT_GROUPS = gql`
  query PermissionDefaultGroups {
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

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  plugin: string;
  permissions: Array<{
    module: string;
    actions: string[];
    scope: string;
  }>;
}

export const usePermissionGroups = () => {
  const { data, loading, error } = useQuery<{ permissionDefaultGroups: PermissionGroup[] }>(
    PERMISSION_DEFAULT_GROUPS
  );

  return {
    permissionGroups: data?.permissionDefaultGroups || [],
    loading,
    error,
  };
};
