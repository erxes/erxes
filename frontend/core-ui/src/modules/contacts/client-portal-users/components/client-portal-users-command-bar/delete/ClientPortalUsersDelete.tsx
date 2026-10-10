import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { CP_USERS_REMOVE } from '@/contacts/client-portal-users/graphql/cpUsersRemove';
import { ApolloError, useMutation } from '@apollo/client';

/** Deletes selected client portal users after confirmation. */
export const ClientPortalUsersDelete = ({
  cpUserIds,
}: {
  cpUserIds: string[];
}) => {
  const { confirm } = useConfirm();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  const { t } = useTranslation('contact', { keyPrefix: 'clientPortalUser' });

  const [cpUsersRemove, { loading }] = useMutation(CP_USERS_REMOVE, {
    refetchQueries: ['getClientPortalUsers'],
  });

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={() =>
        confirm({
          message: t('confirm-delete-selected', { count: cpUserIds.length }),
          options: { confirmationValue: 'delete', okLabel: t('action-delete') },
        }).then(() => {
          cpUsersRemove({
            variables: { ids: cpUserIds },
            onError: (e: ApolloError) => {
              toast({
                title: t('error-title'),
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              table.setRowSelection({});
              toast({
                title: t('success-title'),
                variant: 'success',
                description: t('deleted-success'),
              });
            },
          });
        })
      }
    >
      <IconTrash />
      {t('action-delete')}
    </Button>
  );
};
