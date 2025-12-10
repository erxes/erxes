import { IconPlus } from '@tabler/icons-react';

import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
import { PutResponseDelete } from '@/put-response/components/put-response-command-bar/put-response-delete/PutResponseDelete';

export const PutResponseCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <PutResponseDelete
          productIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
        <Separator.Inline />
        <Button variant="secondary">
          <IconPlus />
          Create
        </Button>

        <PrintDocument
          items={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          contentType="core:putResponse"
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
