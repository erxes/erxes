import {
  branch,
  currency,
  department,
  tax,
  taxPercent,
  uom,
} from '../hooks/getProductColumns';

import { ColumnDef } from '@tanstack/table-core';
import { IProductData } from 'ui-modules';
import { ProductCommandBar } from '../product-command-bar/ProductCommandBar';
import { RecordTable, cn } from 'erxes-ui';
import { productColumns } from './ProductColumns';
import React, { useMemo } from 'react';

const DuplicateAwareRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<typeof RecordTable.Row> & { duplicateIds: Set<string> }
>(({ duplicateIds, original, className, ...props }, ref) => {
  const isDuplicate = original?.productId && duplicateIds.has(original.productId);
  return (
    <RecordTable.Row
      ref={ref}
      original={original}
      className={cn(
        className,
        isDuplicate &&
          'bg-red-50 dark:bg-red-950/30 hover:bg-red-100! dark:hover:bg-red-950/50!',
      )}
      {...props}
    />
  );
});
DuplicateAwareRow.displayName = 'DuplicateAwareRow';

export const ProductsRecordTable = ({
  products,
  refetch,
  dealId,
  showAdvancedView,
  onLocalChange,
}: {
  products: IProductData[];
  refetch: () => void;
  dealId: string;
  showAdvancedView: boolean;
  onLocalChange: (id: string, patch: Partial<IProductData>) => void;
}) => {
  const columns = useMemo<ColumnDef<IProductData>[]>(() => {
    if (!showAdvancedView) return productColumns;

    const newColumns = [...productColumns];

    const discountIndex = newColumns.findIndex((col) => col.id === 'discount');
    if (discountIndex !== -1)
      newColumns.splice(discountIndex + 1, 0, taxPercent, tax);

    const amountIndex = newColumns.findIndex((col) => col.id === 'amount');
    if (amountIndex !== -1)
      newColumns.splice(amountIndex + 1, 0, currency, uom);

    const assignedIndex = newColumns.findIndex(
      (col) => col.id === 'assignedUserId',
    );
    if (assignedIndex !== -1)
      newColumns.splice(assignedIndex + 1, 0, branch, department);

    return newColumns;
  }, [showAdvancedView]);

  const duplicateIds = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const p of products) {
      if (p.productId) {
        if (seen.has(p.productId)) dupes.add(p.productId);
        else seen.add(p.productId);
      }
    }
    return dupes;
  }, [products]);

  const RowWithDuplicates = useMemo(
    () =>
      React.forwardRef<
        HTMLTableRowElement,
        React.ComponentProps<typeof RecordTable.Row>
      >((props, ref) => (
        <DuplicateAwareRow ref={ref} duplicateIds={duplicateIds} {...props} />
      )),
    [duplicateIds],
  );

  return (
    <RecordTable.Provider
      key={showAdvancedView ? 'advanced' : 'basic'}
      columns={columns}
      data={products || []}
      className="my-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList Row={RowWithDuplicates} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ProductCommandBar refetch={refetch} dealId={dealId} />
    </RecordTable.Provider>
  );
};
