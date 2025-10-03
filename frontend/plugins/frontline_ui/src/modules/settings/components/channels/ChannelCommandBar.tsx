import { IconTrash } from '@tabler/icons-react';

import { Button, CommandBar, Separator, useConfirm } from 'erxes-ui';
import { RecordTable } from 'erxes-ui';
import { useChannelRemove } from '../../hooks/useChannelRemove';

export const ChannelCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { channelsRemove } = useChannelRemove();
  const { confirm } = useConfirm();

  const confirmOptions = { confirmationValue: 'delete' };

  const onRemove = () => {
    const ids: string[] = table
      .getSelectedRowModel()
      .rows?.map((row) => row.original._id);

    confirm({
      message: 'Are you sure you want to remove the selected?',
      options: confirmOptions,
    }).then(async () => {
      try {
        channelsRemove({
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
        <Button variant="secondary">
          <IconTrash />
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
