import { CommandBar, RecordTable, Separator } from 'erxes-ui';

import { ProductsDelete } from './ProductDelete';
import { ProductsSplit } from './ProductSplit';

export const ProductCommandBar = ({
  refetch,
  dealId,
}: {
  refetch: () => void;
  dealId: string;
}) => {
  const { table } = RecordTable.useRecordTable();

  const selectedProductIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedProductIds.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {selectedProductIds.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ProductsSplit
          productIds={selectedProductIds}
          refetch={refetch}
          dealId={dealId}
        />
        <Separator.Inline />
        <ProductsDelete
          productIds={selectedProductIds}
          refetch={refetch}
          dealId={dealId}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
