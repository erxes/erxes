import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useVatRowsRemove } from '../hooks/useVatRowsRemove';
import { IconTrash } from '@tabler/icons-react';

export const VatRowsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <VatRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const VatRowsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeVatRows, loading } = useVatRowsRemove();

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete these vat rows?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      const vatRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeVatRows({
        variables: { vatRowIds },
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
            description: 'Vat rows deleted successfully',
          });
        },
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
