import { IconPlus, IconTemplate } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { SaveAsTemplateForm } from 'ui-modules/modules/template';
import { CategoriesDelete } from './delete/CategoryDelete';
import { useState } from 'react';

export const CategoryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const [refreshKey, setRefreshKey] = useState(0);

  const resetSelection = () => {
    table.resetRowSelection(true);
    setRefreshKey((prev) => prev + 1);
  };

  const selectedCategoryIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id);

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
          categoryIds={selectedCategoryIds.join(',')}
          onDeleteSuccess={resetSelection}
        />
        <Separator.Inline />
        <Button variant="secondary">
          <IconPlus />
          Create
        </Button>
        <Separator.Inline />
        <SaveAsTemplateForm
          trigger={
            <Button>
              <IconTemplate />
              Save as Template
            </Button>
          }
          contentType="core:productCategory"
          contentId={selectedCategoryIds}
          title="Save Product Categories as Template"
          onSuccess={() => {
            toast({
              title: 'Template saved successfully',
              variant: 'success',
            });
            resetSelection();
          }}
          onError={(error: Error) => {
            toast({
              title: 'Error saving template',
              description: error.message,
              variant: 'destructive',
            });
          }}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
