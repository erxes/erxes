import {
  branch,
  currency,
  department,
  tax,
  taxPercent,
  uom,
} from './getProductColumns';

import { ColumnDef } from '@tanstack/table-core';
import { IProductData } from 'ui-modules';
import { IconShoppingCart } from '@tabler/icons-react';
import { ProductCommandBar } from '../../product-command-bar/ProductCommandBar';
import { Empty, RecordTable } from 'erxes-ui';
import { productColumns } from './ProductColumns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ProductsRecordTable = ({
  products,
  refetch,
  showAdvancedView,
  hasProductFilters,
}: {
  products: IProductData[];
  refetch: () => void;
  showAdvancedView: boolean;
  hasProductFilters: boolean;
}) => {
  const { t } = useTranslation('sales');

  const columns = useMemo<ColumnDef<IProductData>[]>(() => {
    const baseColumns = productColumns(t);
    if (!showAdvancedView) return baseColumns;

    const newColumns = [...baseColumns];

    const discountIndex = newColumns.findIndex((col) => col.id === 'discount');
    if (discountIndex !== -1)
      newColumns.splice(discountIndex + 1, 0, taxPercent(t), tax(t));

    const amountIndex = newColumns.findIndex((col) => col.id === 'amount');
    if (amountIndex !== -1)
      newColumns.splice(amountIndex + 1, 0, currency(t), uom(t));

    const assignedIndex = newColumns.findIndex(
      (col) => col.id === 'assignUserId',
    );
    if (assignedIndex !== -1)
      newColumns.splice(assignedIndex + 1, 0, branch(t), department(t));

    return newColumns;
  }, [showAdvancedView, t]);

  return (
    <RecordTable.Provider
      key={showAdvancedView ? 'advanced' : 'basic'}
      columns={columns}
      data={products}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border"
      stickyColumns={[
        'more',
        'checkbox',
        'name',
        'type',
        'unitPrice',
        'assignUserId',
      ]}
      tableId="products_record_table"
    >
      {products.length === 0 ? (
        <Empty className="border-0 bg-transparent">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconShoppingCart />
            </Empty.Media>
            <Empty.Title>{t('no-products-found')}</Empty.Title>
            <Empty.Description>
              {t(
                hasProductFilters
                  ? 'no-products-filter-description'
                  : 'no-products-description',
              )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </div>
      )}
      <ProductCommandBar refetch={refetch} />
    </RecordTable.Provider>
  );
};
