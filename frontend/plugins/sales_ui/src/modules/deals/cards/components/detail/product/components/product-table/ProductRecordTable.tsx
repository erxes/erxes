import type { DealProductData } from '@/deals/utils/dealJson';
import {
  branch,
  currency,
  department,
  tax,
  taxPercent,
  uomRatio,
} from './getProductColumns';

import { ColumnDef } from '@tanstack/table-core';

import { IconShoppingCart } from '@tabler/icons-react';
import { Empty, RecordTable } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCommandBar } from '../../product-command-bar/ProductCommandBar';
import { productColumns } from './ProductColumns';

const UOM_INFO_COLUMN_IDS = [
  'uomInfo.uom',
  'uomInfo.unitPrice',
  'uomInfo.quantity',
];
const BASE_UOM_COLUMN_IDS = ['unitPrice', 'quantity', 'uom'];
const UOM_COLUMN_IDS = [...UOM_INFO_COLUMN_IDS, ...BASE_UOM_COLUMN_IDS];

const ProductUomColumnPosition = ({
  showAdvancedView,
}: {
  showAdvancedView: boolean;
}) => {
  const { table } = RecordTable.useRecordTable();
  const columnOrder = table.getState().columnOrder;

  useEffect(() => {
    const productIndex = columnOrder.indexOf('name');
    const unitColumns = showAdvancedView ? UOM_COLUMN_IDS : UOM_INFO_COLUMN_IDS;
    if (
      productIndex === -1 ||
      unitColumns.every(
        (id, index) => columnOrder[productIndex + index + 1] === id,
      )
    )
      return;

    const nextOrder = columnOrder.filter((id) => !UOM_COLUMN_IDS.includes(id));
    nextOrder.splice(nextOrder.indexOf('name') + 1, 0, ...unitColumns);
    table.setColumnOrder(nextOrder);
  }, [columnOrder, table, showAdvancedView]);

  return null;
};

export const ProductsRecordTable = ({
  products,
  refetch,
  showAdvancedView,
  showTaxView,
  hasProductFilters,
}: {
  products: DealProductData[];
  refetch: () => void;
  showAdvancedView: boolean;
  showTaxView: boolean;
  hasProductFilters: boolean;
}) => {
  const { t } = useTranslation('sales');

  const columns = useMemo<ColumnDef<DealProductData>[]>(() => {
    const baseColumns = productColumns(t).filter(
      (column) =>
        (showTaxView || column.id !== 'isVatApplied') &&
        (showAdvancedView || !BASE_UOM_COLUMN_IDS.includes(column.id || '')),
    );
    if (!showAdvancedView && !showTaxView) return baseColumns;

    const newColumns = [...baseColumns];

    if (showTaxView) {
      const discountIndex = newColumns.findIndex(
        (col) => col.id === 'discount',
      );
      if (discountIndex !== -1)
        newColumns.splice(discountIndex + 1, 0, taxPercent(t), tax(t));
    }

    if (showAdvancedView) {
      const amountIndex = newColumns.findIndex((col) => col.id === 'amount');
      if (amountIndex !== -1)
        newColumns.splice(amountIndex + 1, 0, currency(t), uomRatio(t));

      const assignedIndex = newColumns.findIndex(
        (col) => col.id === 'assignUserId',
      );
      if (assignedIndex !== -1)
        newColumns.splice(assignedIndex + 1, 0, branch(t), department(t));
    }

    return newColumns;
  }, [showAdvancedView, showTaxView, t]);

  return (
    <RecordTable.Provider
      key={`${showAdvancedView ? 'advanced' : 'basic'}-${
        showTaxView ? 'tax' : 'no-tax'
      }`}
      columns={columns}
      data={products}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border"
      stickyColumns={['more', 'checkbox', 'name']}
      tableId={
        showAdvancedView || showTaxView
          ? `products_record_table_${showAdvancedView ? 'advanced' : 'basic'}_${
              showTaxView ? 'tax' : 'no_tax'
            }`
          : 'products_record_table'
      }
    >
      <ProductUomColumnPosition showAdvancedView={showAdvancedView} />
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
