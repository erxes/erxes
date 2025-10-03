import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useAccountCategoriesRemove } from '../hooks/useAccountCategoriesRemove';
import { IconTrash } from '@tabler/icons-react';

export const AccountCategoriesCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <AccountCategoriesDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const AccountCategoriesDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeAccountCategories, loading } = useAccountCategoriesRemove();

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete these account categories?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      const accountCategoryIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);
      accountCategoryIds.forEach((accountCategoryId) => {
        removeAccountCategories({
          variables: { _id: accountCategoryId },
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
              description: 'Account categories deleted successfully',
            });
          },
        });
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Delete
    </Button>
  );
};
