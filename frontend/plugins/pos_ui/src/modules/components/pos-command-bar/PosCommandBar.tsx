import { IconPlus } from '@tabler/icons-react';

import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PosDelete } from './delete/delete';

export const PosCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <PosDelete
          posIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id).join(',')}
        />
        <Separator.Inline />
        <Button variant="secondary">
          <IconPlus />
          Create
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
