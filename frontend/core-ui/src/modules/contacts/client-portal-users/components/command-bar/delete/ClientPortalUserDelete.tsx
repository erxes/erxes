import { IconTrash } from '@tabler/icons-react';
import { Button, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useRemoveCpUsers } from '@/contacts/client-portal-users/hooks/useRemoveClientPortalUser';

export const CPUsersDelete = ({ clientIds }: { clientIds: string[] }) => {
  const { confirm } = useConfirm();
  const { removeCpUsers } = useRemoveCpUsers();
  const { table } = RecordTable.useRecordTable();
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${clientIds.length} selected clients?`,
        }).then(() => {
          removeCpUsers(clientIds, {
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
                description: 'Users deleted successfully',
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
