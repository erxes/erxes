import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useTrRecordsRemove } from '../hooks/useTrRecordsRemove';

export const TransactionsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <TransactionsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const TransactionsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeTrRecords, loading } = useTrRecordsRemove();

  const handleDelete = () =>
    confirm({
      message: 'Are you sure you want to delete these transaction records?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      
      // Delete each transaction record by parentId
      selectedRows.forEach((row) => {
        if (row.original.parentId) {
          removeTrRecords(row.original.parentId);
        }
      });
      
      // Clear selection after deletion
      table.setRowSelection({});
    });

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Delete
    </Button>
  );
};
