import { useMutation } from '@apollo/client';
import { REMOVE_PERMISSION_GROUP_MUTATION } from '@/settings/permissions/graphql/permissionGroupsMutations';

export const useRemovePermissionGroup = () => {
  const [removePermissionGroup, { loading }] = useMutation(
    REMOVE_PERMISSION_GROUP_MUTATION,
    {
      refetchQueries: ['permissionGroups'],
    },
  );
  return { removePermissionGroup, loading };
};
