import { ADD_PERMISSION_GROUP_MUTATION } from '@/settings/permissions/graphql/permissionGroupsMutations';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';

export const useAddPermissionGroup = () => {
  const [addPermissionGroup, { loading }] = useMutation(
    ADD_PERMISSION_GROUP_MUTATION,
    {
      onCompleted: () => {
        toast({ title: 'Permission group added', variant: 'success' });
      },
      onError: (error) => {
        toast({
          title: 'Error adding permission group',
          variant: 'destructive',
          description: error.message,
        });
      },
    },
  );
  return { addPermissionGroup, loading };
};
