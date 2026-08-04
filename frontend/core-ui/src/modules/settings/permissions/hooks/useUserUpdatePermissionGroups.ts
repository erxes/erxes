import { useMutation } from '@apollo/client';
import { UPDATE_USER_PERMISSION_GROUPS_MUTATION } from '../graphql/permissionGroupsMutations';

export const useUserUpdatePermissionGroups = () => {
  const [updatePermissionGroups, { error, loading }] = useMutation(
    UPDATE_USER_PERMISSION_GROUPS_MUTATION,
  );
  return {
    updatePermissionGroups,
    error,
    loading,
  };
};
