import { MutationHookOptions, useMutation } from '@apollo/client';
import { ROLES_UPSERT } from '@/settings/team-member/graphql/roleMutation';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
export const useRoleUpsert = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [_roleUpsert, { loading }] = useMutation(ROLES_UPSERT);

  const roleUpsert = ({ variables, ...options }: MutationHookOptions) => {
    _roleUpsert({
      ...options,
      variables,
      onCompleted: (data) => {
        toast({
          title: t('role-updated', 'Role has been updated'),
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('role-update-failed', 'Failed to update role'),
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
