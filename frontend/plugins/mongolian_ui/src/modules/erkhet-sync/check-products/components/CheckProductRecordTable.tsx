import { RecordTable, Button } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { CHECK_PRODUCTS_CURSOR_SESSION_KEY } from '../constants/checkProductsCursorSessionKey';
import { useCheckProduct } from '../hooks/useCheckProduct';
import { checkProductColumns } from './CheckProductColumn';

export const CheckProductRecordTable = () => {
  const {
    filteredProducts,
    loading,
    pageInfo,
    checkProduct,
    syncProducts,
    syncLoading,
    toCheckProducts,
  } = useCheckProduct();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleFetchMore = () => {
    checkProduct();
  };

  return (
    <div className="m-3 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <Button
          onClick={syncProducts}
          disabled={
            syncLoading || !filteredProducts || filteredProducts.length === 0
          }
        >
          {syncLoading ? 'Syncing...' : 'Sync'}
        </Button>
      </div>

      <RecordTable.Provider
        columns={checkProductColumns}
        data={filteredProducts || []}
        className="h-full w-full px-2 overflow-y-auto"
        stickyColumns={['more', 'checkbox', 'createdAt']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={filteredProducts?.length}
          sessionKey={CHECK_PRODUCTS_CURSOR_SESSION_KEY}
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
          {!loading && !toCheckProducts && filteredProducts?.length === 0 && (
            <div className="absolute inset-0">
              <div className="h-full w-full px-8 flex justify-center">
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="mb-6">
                    <IconShoppingCartX
                      size={64}
                      className="text-muted-foreground mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      No product yet
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Get started by creating your first product.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
