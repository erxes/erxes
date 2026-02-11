import { CommandBar, RecordTable, Separator } from 'erxes-ui';

import { ProductsDelete } from './ProductDelete';

export const ProductCommandBar = ({
  refetch,
  dealId,
}: {
  refetch: () => void;
  dealId: string;
}) => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ProductsDelete
          productIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
          refetch={refetch}
          dealId={dealId}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
