import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS_CURSOR_SESSION_KEY } from '../constants/productsCursorSessionKey';
import { useProducts } from '../hooks/useProducts';
import { selectedProductIdsAtom } from '../states/productCounts';
import { productColumns } from './ProductColumns';
import { ReCalcRemainderForm } from './ReCalcRemainderForm';

export const ProductsRecordTable = () => {
  const { productsMain, handleFetchMore, loading, pageInfo } = useProducts();
  const { t } = useTranslation('product');

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={productColumns(t)}
      data={productsMain || []}
      className="h-full"
      stickyColumns={['checkbox', 'code', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={productsMain?.length}
        sessionKey={PRODUCTS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
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
    </RecordTable.Provider>
  );
};

const ProductsCommandBar = () => {
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
          {selectedRows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ReCalcRemainderForm />
      </CommandBar.Bar>
    </CommandBar>
  );
};
