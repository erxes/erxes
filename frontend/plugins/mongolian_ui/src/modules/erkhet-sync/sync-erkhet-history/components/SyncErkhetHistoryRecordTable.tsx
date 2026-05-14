import { RecordTable } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { SYNC_HISTORIES_CURSOR_SESSION_KEY } from '../constants/syncErkhetHistoryCursorSessoinKey';
import { syncErkhetHistoryColumns } from './SyncErkhetHistoryColumns';
import { useSyncErkhetHistory } from '../hooks/useSyncErkhetHistory';
export const SyncErkhetHistoryRecordTable = () => {
  const { SyncHistories, handleFetchMore, loading, pageInfo } =
    useSyncErkhetHistory();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={syncErkhetHistoryColumns}
      data={SyncHistories || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'createdAt']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={SyncHistories?.length}
        sessionKey={SYNC_HISTORIES_CURSOR_SESSION_KEY}
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
        {!loading && SyncHistories?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconShoppingCartX
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No sync yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first sync.
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
