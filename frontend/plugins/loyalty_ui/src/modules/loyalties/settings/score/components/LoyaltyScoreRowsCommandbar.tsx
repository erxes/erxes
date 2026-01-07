import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useLoyaltyScoreRowsRemove } from '../hooks/useLoyaltyScoreRowsRemove';

export const LoyaltyScoreRowsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <LoyaltyScoreRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const LoyaltyScoreRowsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeLoyaltyScoreRows, loading } = useLoyaltyScoreRowsRemove();

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete these loyalty score rows?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      const loyaltyScoreRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeLoyaltyScoreRows({
        variables: { ids: loyaltyScoreRowIds },
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
            description: 'Loyalty score rows deleted successfully',
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
