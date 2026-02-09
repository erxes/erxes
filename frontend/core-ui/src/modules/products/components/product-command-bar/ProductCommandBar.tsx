import { IconPlus } from '@tabler/icons-react';

import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
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
      </CommandBar.Bar>
    </CommandBar>
  );
};
