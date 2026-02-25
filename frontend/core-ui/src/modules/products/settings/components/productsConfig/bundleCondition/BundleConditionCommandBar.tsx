import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { useBundleConditionRemove } from '@/products/settings/hooks/useBundleConditionRemove';

export const BundleConditionCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeBundleConditions } = useBundleConditionRemove();

  const handleDelete = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id);

    confirm({
      message: `Are you sure you want to delete the ${
        selectedIds.length
      } selected bundle condition${selectedIds.length === 1 ? '' : 's'}?`,
    }).then(() => {
      removeBundleConditions({
        variables: { _ids: selectedIds },
        onCompleted: () => {
          table.resetRowSelection();
        },
      });
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
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
