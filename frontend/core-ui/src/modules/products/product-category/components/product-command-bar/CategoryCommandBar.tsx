import { IconPlus } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { CategoriesDelete } from './delete/CategoryDelete';
import { useState } from 'react';

export const CategoryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const [refreshKey, setRefreshKey] = useState(0);

  const resetSelection = () => {
    table.resetRowSelection(true);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <CommandBar 
      key={refreshKey} 
      open={table.getFilteredSelectedRowModel().rows.length > 0}
    >
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <CategoriesDelete
          categoryIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id).join(',')}
          onDeleteSuccess={resetSelection}
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