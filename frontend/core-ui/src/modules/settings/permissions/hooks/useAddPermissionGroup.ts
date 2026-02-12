import { useMutation } from '@apollo/client';

import { ADD_PERMISSION_GROUP_MUTATION } from '@/settings/permissions/graphql/permissionGroupsMutations';

export const useAddPermissionGroup = () => {
  const [addPermissionGroup, { loading }] = useMutation(
    ADD_PERMISSION_GROUP_MUTATION,
    {
      refetchQueries: ['permissionGroups'],
    },
  );
  return { addPermissionGroup, loading };
};
