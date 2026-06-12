import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, useConfirm } from 'erxes-ui';
import { useRemoveSimilarity } from '../hooks/useRemoveSimilarity';

export const SimilarityCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { remove } = useRemoveSimilarity();
  const { confirm } = useConfirm();

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id);

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete the ${selectedIds.length} selected group${
        selectedIds.length === 1 ? '' : 's'
      }? Generated products are not deleted.`,
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      await Promise.all(selectedIds.map((id) => remove(id)));
      table.resetRowSelection();
    });
  };

  return (
    <CommandBar open={selectedIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedIds.length} selected</CommandBar.Value>
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
        >
          <IconTrash />
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
