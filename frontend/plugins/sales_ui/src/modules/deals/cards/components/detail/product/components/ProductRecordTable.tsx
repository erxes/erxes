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
import { RecordTable } from 'erxes-ui';
import { productColumns } from './ProductColumns';
import { useMemo } from 'react';

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

  return (
    <RecordTable.Provider
      key={showAdvancedView ? 'advanced' : 'basic'}
      columns={columns}
      data={products || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ProductCommandBar refetch={refetch} dealId={dealId} />
    </RecordTable.Provider>
  );
};
