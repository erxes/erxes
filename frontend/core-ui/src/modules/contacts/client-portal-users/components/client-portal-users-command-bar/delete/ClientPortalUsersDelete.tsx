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
          message: `Are you sure you want to delete the ${cpUserIds.length} selected client portal users?`,
          options: { confirmationValue: 'delete', okLabel: 'Delete' },
        }).then(() => {
          cpUsersRemove({
            variables: { ids: cpUserIds },
            onError: (e: ApolloError) => {
              toast({
                title: 'Error',
                description: e.message,
                variant: 'destructive',
              });
            },
            onCompleted: () => {
              table.setRowSelection({});
              toast({
                title: 'Success',
                variant: 'success',
                description: 'Client portal users deleted successfully',
              });
            },
          });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
