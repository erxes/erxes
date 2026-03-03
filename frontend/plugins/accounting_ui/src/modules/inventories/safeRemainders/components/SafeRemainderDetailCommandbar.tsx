import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useSafeRemainderItemsRemove } from '../hooks/useSafeRemainderItemRemove';

export const SafeRemDetailCommandbar = () => {
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
  const { removeRemItems, loading } = useSafeRemainderItemsRemove();

  const handleDelete = () =>
    confirm({
      message: 'Are you sure you want to delete these accounts?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      removeRemItems({
        variables: {
          ids: table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id),
        },
        onCompleted: () => {
          table.setRowSelection({});
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
