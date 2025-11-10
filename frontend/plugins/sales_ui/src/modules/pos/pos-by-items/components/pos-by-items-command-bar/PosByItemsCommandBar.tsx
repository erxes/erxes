import { IconPlus } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PosByItemsDelete } from '@/pos/pos-by-items/components/delete/PosByItemsDelete';

export const PosByItemsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <PosByItemsDelete
          posByItemsIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original?._id)
            .filter((id): id is string => Boolean(id))
            .join(',')}
        />
        <Separator.Inline />
        <Button variant="secondary" onClick={() => {}}>
          <IconPlus />
          Create
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
