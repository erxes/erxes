// hooks/useEditPermissionGroup.ts

import { useMutation } from '@apollo/client';
import { EDIT_PERMISSION_GROUP_MUTATION } from '@/settings/permissions/graphql/permissionGroupsMutations';

export const useEditPermissionGroup = () => {
  const [editPermissionGroup, { loading }] = useMutation(
    EDIT_PERMISSION_GROUP_MUTATION,
    {
      refetchQueries: ['permissionGroups'],
    },
  );
  return { editPermissionGroup, loading };
};
