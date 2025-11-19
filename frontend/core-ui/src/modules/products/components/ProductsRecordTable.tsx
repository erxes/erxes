import { RecordTable } from 'erxes-ui';

import { productColumns } from '@/products/components/ProductColumns';
import { ProductCommandBar } from '@/products/components/product-command-bar/ProductCommandBar';
import { useProducts } from '@/products/hooks/useProducts';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';

import { IconShoppingCartX } from '@tabler/icons-react';
import { ProductAddSheet } from '@/products/components/ProductAddSheet';
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
        {!loading && productsMain?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconShoppingCartX
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No product yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first product.
                  </p>
                </div>
                <ProductAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <ProductCommandBar />
    </RecordTable.Provider>
  );
};
