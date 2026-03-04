import { IconPlus } from '@tabler/icons-react';

import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { Export, PrintDocument } from 'ui-modules';
import { ProductsDelete } from './delete/productDelete';
import { TemplateSheet } from 'ui-modules/modules/templates/components/TemplateSheet';

export const ProductCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Export
          pluginName="core"
          moduleName="product"
          collectionName="product"
          buttonVariant="secondary"
          ids={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
        <Separator.Inline />
        <ProductsDelete
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
          contentType="core:product"
        />
        <TemplateSheet
          contentType="core:products"
          contentId={
            table
              .getFilteredSelectedRowModel()
              .rows.map((row) => row.original._id)[0]
          }
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
