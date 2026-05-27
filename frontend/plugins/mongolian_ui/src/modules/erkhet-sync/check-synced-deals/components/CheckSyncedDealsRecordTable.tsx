import { Button, RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { checkSyncedDealsColumns } from './CheckSyncedDealsColumn';

import { CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY } from '../constants/checkSyncedDealsCursorSessionKey';
import { useCheckSyncedDeals } from '../hooks/useCheckSyncedDeals';
import { ICheckSyncedDeals } from '../types/checkSyncedDeals';

const CheckDealsButton = ({
  deals,
  checking,
  onCheck,
}: {
  deals: ICheckSyncedDeals[];
  checking: boolean;
  onCheck: (ids: string[]) => void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getSelectedRowModel().rows;
  const ids = (
    selectedRows.length
      ? selectedRows.map((row) => row.original._id)
      : deals.map((deal) => deal._id)
  ).filter(Boolean);

  return (
    <div className="flex items-center justify-between gap-3 px-3 pt-3">
      <div className="text-sm text-muted-foreground">
        {selectedRows.length
          ? `${selectedRows.length} selected`
          : `${deals.length} deals`}
      </div>
      <Button onClick={() => onCheck(ids)} disabled={checking || !ids.length}>
        {checking ? 'Checking...' : 'Check Deals'}
      </Button>
    </div>
  );
};

export const CheckSyncedDealsRecordTable = () => {
  const { Deals, checkDeals, checking, handleFetchMore, loading, pageInfo } =
    useCheckSyncedDeals();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={checkSyncedDealsColumns || []}
      data={Deals || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'createdAt']}
    >
      <CheckDealsButton
        deals={Deals || []}
        checking={checking}
        onCheck={checkDeals}
      />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={Deals?.length}
        sessionKey={CHECK_SYNCED_DEALS_CURSOR_SESSION_KEY}
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
        {!loading && Deals?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No sync yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first sync.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
