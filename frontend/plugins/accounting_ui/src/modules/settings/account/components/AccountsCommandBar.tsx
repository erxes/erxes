import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useAccountsRemove } from '../hooks/useAccountsRemove';

export const AccountsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <AccountsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const AccountsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeAccounts, loading } = useAccountsRemove();

  const handleDelete = () =>
    confirm({
      message: 'Are you sure you want to delete these accounts?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      removeAccounts({
        variables: {
          accountIds: table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id),
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: 'Success',
            description: 'Accounts deleted successfully',
          });
        },
      });
    });

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Delete
    </Button>
  );
};
