import { IconPlus, IconTemplate } from '@tabler/icons-react';

import { Button, CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
import { SaveAsTemplateForm } from 'ui-modules/modules/template';
import { ProductsDelete } from './delete/productDelete';

export const ProductCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedProductIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id);

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ProductsDelete productIds={selectedProductIds} />
        <Separator.Inline />
        <Button variant="secondary">
          <IconPlus />
          Create
        </Button>
        <Separator.Inline />
        <PrintDocument
          items={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          contentType="core:product"
        />
        <Separator.Inline />
        <SaveAsTemplateForm
          trigger={
            <Button>
              <IconTemplate />
              Save as Template
            </Button>
          }
          contentType="core:product"
          contentId={selectedProductIds}
          title="Save Products as Template"
          onSuccess={() => {
            toast({
              title: 'Template saved successfully',
              variant: 'success',
            });
            table.resetRowSelection();
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
