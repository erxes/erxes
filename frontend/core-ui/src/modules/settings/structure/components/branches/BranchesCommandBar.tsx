import { IconTrash } from '@tabler/icons-react';

import {
  Button,
  CommandBar,
  Separator,
  useConfirm,
  RecordTable,
} from 'erxes-ui';
import { useRemoveBranch } from '../../hooks/useBranchActions';

export const BranchesCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { handleRemove } = useRemoveBranch();
  const { confirm } = useConfirm();

  const confirmOptions = { confirmationValue: 'delete' };

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

    confirm({
      message: 'Are you sure you want to remove the selected?',
      options: confirmOptions,
    }).then(async () => {
      try {
        handleRemove({
          variables: {
            ids,
          },
        });
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={onRemove}>
          <IconTrash />
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
