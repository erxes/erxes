import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useRemovePosInEbarimtConfigs } from '@/ebarimt/settings/pos-in-ebarimt-config/hooks/useRemovePosInEbarimtConfigs';

export const PosInEBarimtConfigCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <PosInEBarimtConfigDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const PosInEBarimtConfigDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeConfigs, loading } = useRemovePosInEbarimtConfigs();

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete selected configs?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      const ids = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeConfigs(ids)
        .then(() => {
          table.setRowSelection({});
          toast({
            title: 'Success',
            description: 'Configurations deleted successfully',
          });
        })
        .catch((error: Error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
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
