import { MutationHookOptions, useMutation } from '@apollo/client';
import { ROLES_UPSERT } from '@/settings/team-member/graphql/roleMutation';
import { toast } from 'erxes-ui';
export const useRoleUpsert = () => {
  const [_roleUpsert, { loading }] = useMutation(ROLES_UPSERT);

  const roleUpsert = ({ variables, ...options }: MutationHookOptions) => {
    _roleUpsert({
      ...options,
      variables,
      onCompleted: (data) => {
        toast({ title: 'Role has been updated', variant: 'default' });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: 'Failed to update role',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      update: (cache) => {
        cache.modify({
          id: cache.identify({ _id: variables?.userId, __typename: 'User' }),
          fields: {
            role: () => variables?.role,
          },
          optimistic: true,
        });
      },
    });
  };

  return { roleUpsert, loading };
};