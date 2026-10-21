import { IconPackageOff } from '@tabler/icons-react';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/inventories/remainders/constants/productsCursorSessionKey';
import { useProducts } from '@/inventories/remainders/hooks/useProducts';
import { selectedProductIdsAtom } from '@/inventories/remainders/states/productCounts';
import { productColumns } from '@/inventories/remainders/components/ProductColumns';
import { ReCalcRemainderForm } from '@/inventories/remainders/components/ReCalcRemainderForm';

export const ProductsRecordTable = () => {
  const { productsMain, handleFetchMore, loading, error, pageInfo } =
    useProducts();
  const { t } = useTranslation('accounting');

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const isEmpty = !loading && !productsMain?.length;

  return (
    <RecordTable.Provider
      columns={productColumns(t)}
      data={productsMain || []}
      className="relative h-full"
      stickyColumns={['checkbox', 'code', 'name']}
      tableId="accounting_inventory_remainders_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={productsMain?.length}
        sessionKey={PRODUCTS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header showColumnSelector />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <ProductsCommandBar />
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconPackageOff}
          description={t('empty-generated-description')}
        />
      )}
    </RecordTable.Provider>
  );
};

const ProductsCommandBar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const setSelectedProductIds = useSetAtom(selectedProductIdsAtom);

  useEffect(() => {
    setSelectedProductIds(
      selectedRows.map((row) => row.original._id as string),
    );
  }, [selectedRows.length, setSelectedProductIds, selectedRows]);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selectedRows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <ReCalcRemainderForm />
      </CommandBar.Bar>
    </CommandBar>
  );
};
