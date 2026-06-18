import { IconShoppingCartX } from '@tabler/icons-react';
import { Button, RecordTable } from 'erxes-ui';

import { MS_DYNAMIC_SESSION_KEYS } from '@/msdynamic/constants/msDynamicSessionKey';
import { useMSDynamicCheckProducts } from '../hooks/useMSDynamicCheckProducts';
import { msDynamicCheckProductColumns } from './MSDynamicCheckProductsColumns';

/** Products record table with sync and cursor pagination */
export const MSDynamicCheckProductsRecordTable = () => {
  const {
    filteredProducts,
    checking,
    syncing,
    syncableProducts,
    syncProducts,
    checkProducts,
    pageInfo,
  } = useMSDynamicCheckProducts();
  const { hasPreviousPage, hasNextPage } = pageInfo;

  return (
    <RecordTable.Provider
      columns={msDynamicCheckProductColumns}
      data={filteredProducts}
      className="h-full w-full px-2 overflow-y-auto"
      stickyColumns={['checkbox']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={filteredProducts.length}
        sessionKey={MS_DYNAMIC_SESSION_KEYS.products}
      >
        {syncableProducts.length > 0 && (
          <div className="p-2">
            <Button onClick={syncProducts} disabled={syncing || checking}>
              Sync Products
            </Button>
          </div>
        )}
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={checkProducts}
            />
            {checking && <RecordTable.RowSkeleton rows={20} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={checkProducts}
            />
          </RecordTable.Body>
        </RecordTable>

        {!checking && filteredProducts.length === 0 && (
          <div className="absolute inset-0">
            <div className="h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center">
                <IconShoppingCartX
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No products in this group
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Run check or choose another product group.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
