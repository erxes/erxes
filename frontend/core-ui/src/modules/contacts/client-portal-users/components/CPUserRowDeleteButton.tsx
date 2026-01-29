import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useQueryState, useToast } from 'erxes-ui';
import { CP_USERS_REMOVE } from '@/contacts/client-portal-users/graphql/cpUsersRemove';
import { ICPUser } from '@/contacts/client-portal-users/types/cpUser';
import { ApolloError, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';

export function CPUserRowDeleteButton({ row }: { row: ICPUser }) {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('contact');
  const [, setCpUserId] = useQueryState<string>('cpUserId');

  const [cpUsersRemove, { loading }] = useMutation(CP_USERS_REMOVE, {
    refetchQueries: ['getClientPortalUsers'],
  });

  const handleClick = () => {
    confirm({
      message: t('clientPortalUser.delete.confirm', {
        defaultValue:
          'Are you sure you want to delete this client portal user?',
      }),
    }).then(() => {
      cpUsersRemove({
        variables: { _id: row._id },
        onError: (e: ApolloError) => {
          toast({
            title: t('error', { defaultValue: 'Error' }),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          // setCpUserId((current) => (current === row._id ? null : current));
          toast({
            title: t('success', { defaultValue: 'Success' }),
            variant: 'success',
            description: t('clientPortalUser.delete.success', {
              defaultValue: 'User deleted',
            }),
          });
        },
      });
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:text-destructive"
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      disabled={loading}
    >
      <IconTrash className="w-4 h-4" />
    </Button>
  );
}
