import { RecordTable } from 'erxes-ui';

import { productColumns } from '@/products/components/ProductColumns';
import { ProductCommandBar } from '@/products/components/product-command-bar/ProductCommandBar';
import { useProducts } from '@/products/hooks/useProducts';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';
export const ProductsRecordTable = () => {
  const { productsMain, handleFetchMore, loading, pageInfo } = useProducts();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={productColumns}
      data={productsMain || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
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
      <ProductCommandBar />
    </RecordTable.Provider>
  );
};
