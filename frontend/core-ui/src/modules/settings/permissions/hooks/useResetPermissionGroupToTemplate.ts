import { useMutation } from '@apollo/client';
import { RESET_PERMISSION_GROUP_TO_TEMPLATE_MUTATION } from '@/settings/permissions/graphql/permissionGroupsMutations';

export const useResetPermissionGroupToTemplate = () => {
  const [resetPermissionGroupToTemplate, { loading }] = useMutation(
    RESET_PERMISSION_GROUP_TO_TEMPLATE_MUTATION,
    {
      refetchQueries: ['permissionGroups', 'CurrentUserPermissions'],
    },
  );
  return { resetPermissionGroupToTemplate, loading };
};
