import { useMutation } from '@apollo/client';
import { UPDATE_USERS_PERMISSION_GROUPS_MUTATION } from '../graphql/permissionGroupsMutations';

export const useUsersUpdatePermissionGroups = () => {
  const [updatePermissionGroups, { error, loading }] = useMutation(
    UPDATE_USERS_PERMISSION_GROUPS_MUTATION,
  );
  return {
    updatePermissionGroups,
    error,
    loading,
  };
};
