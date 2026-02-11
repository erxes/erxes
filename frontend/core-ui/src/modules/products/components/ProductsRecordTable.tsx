import { RecordTable } from 'erxes-ui';

import { productColumns } from '@/products/components/ProductColumns';
import { ProductCommandBar } from '@/products/components/product-command-bar/ProductCommandBar';
import { useProducts } from '@/products/hooks/useProducts';
import { PRODUCTS_CURSOR_SESSION_KEY } from '@/products/constants/productsCursorSessionKey';
import { useTranslation } from 'react-i18next';

import { IconShoppingCartX } from '@tabler/icons-react';
import { ProductAddSheet } from '@/products/components/ProductAddSheet';
export const ProductsRecordTable = () => {
  const { productsMain, handleFetchMore, loading, pageInfo } = useProducts();
  const { t } = useTranslation('product');

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={productColumns(t)}
      data={productsMain || []}
      className="h-full"
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
            <div className="flex justify-center px-8 w-full h-full">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconShoppingCartX
                    size={64}
                    className="mx-auto mb-4 text-muted-foreground"
                  />
                  <h3 className="mb-2 text-xl font-semibold">No product yet</h3>
                  <p className="max-w-md text-muted-foreground">
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
