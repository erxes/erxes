import { useMutation } from '@apollo/client';
import { MOVE_PERMISSION_GROUP_MEMBERS_MUTATION } from '@/settings/permissions/graphql/permissionGroupsMutations';

export const useMovePermissionGroupMembers = () => {
  const [movePermissionGroupMembers, { loading }] = useMutation(
    MOVE_PERMISSION_GROUP_MEMBERS_MUTATION,
    {
      refetchQueries: ['permissionGroupMembers', 'permissionGroups', 'Users'],
      awaitRefetchQueries: true,
    },
  );
  return { movePermissionGroupMembers, loading };
};
