import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useCtaxRowsRemove } from '../hooks/useCtaxRowsRemove';
import { IconTrash } from '@tabler/icons-react';

export const CtaxRowsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} сонгосон
        </CommandBar.Value>
        <Separator.Inline />
        <CtaxRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const CtaxRowsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeCtaxRows, loading } = useCtaxRowsRemove();

  const handleDelete = () => {
    confirm({
      message: 'Эдгээр НХАТ-ын мөрийг устгахдаа итгэлтэй байна уу?',
      options: {
        okLabel: 'Устгах',
        cancelLabel: 'Болих',
      },
    }).then(() => {
      const ctaxRowIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeCtaxRows({
        variables: { ctaxRowIds },
        onError: (error: Error) => {
          toast({
            title: 'Алдаа',
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: 'Амжилттай',
            description: 'НХАТ-ын мөрийг устгалаа',
          });
        },
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Устгах
    </Button>
  );
};
