import { IconPlus } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { CategoriesDelete } from './delete/CategoryDelete';
import { useState } from 'react';
import { Can, TemplateSheet } from 'ui-modules';

export const CategoryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const [refreshKey, setRefreshKey] = useState(0);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCategories = selectedRows.map((row) => row.original);

  const resetSelection = () => {
    table.resetRowSelection(true);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <CommandBar key={refreshKey} open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <CategoriesDelete
          categories={selectedCategories}
          onDeleteSuccess={resetSelection}
        />
        <Separator.Inline />
        <Can action="productCategoriesManage">
          <Button variant="secondary">
            <IconPlus />
            Create
          </Button>
        </Can>

        <Separator.Inline />
        <TemplateSheet
          contentType="core:product:productCategory"
          contentId={selectedCategories[0]?._id}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
