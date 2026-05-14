import { RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { checkPosOrdersColumns } from './CheckPosOrdersColumn';

import { CHECK_POS_ORDERS_CURSOR_SESSION_KEY } from '../constants/checkPosOrdersCursorSessionKey';
import { useCheckPosOrders } from '../hooks/useCheckPosOrders';

export const CheckPosOrdersRecordTable = () => {
  const { checkPosOrders, handleFetchMore, loading, pageInfo } =
    useCheckPosOrders();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={checkPosOrdersColumns || []}
      data={checkPosOrders || [{}]}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'createdAt']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={checkPosOrders?.length}
        sessionKey={CHECK_POS_ORDERS_CURSOR_SESSION_KEY}
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
        {!loading && checkPosOrders?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconShoppingCartX
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
