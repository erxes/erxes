import { IconShoppingCartX } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { msDynamicSyncHistoryColumns } from './MSDynamicSyncHistoryColumns';
import { useMSDynamicSyncHistory } from '../hooks/useMSDynamicSyncHistory';
import { MSDynamicSyncHistoryDetailSheet } from './MSDynamicSyncHistoryDetailSheet';
import { getMSDynamicSessionKey } from '../../constants/msDynamicSessionKey';

export const MSDynamicSyncHistoryRecordTable = () => {
  const { syncHistories, handleFetchMore, loading, pageInfo } =
    useMSDynamicSyncHistory();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={msDynamicSyncHistoryColumns}
      data={syncHistories || []}
      className="m-3"
      stickyColumns={['more', 'createdAt']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={syncHistories?.length}
        sessionKey={getMSDynamicSessionKey('syncHistory')}
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
        {!loading && syncHistories?.length === 0 && (
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
        <MSDynamicSyncHistoryDetailSheet histories={syncHistories || []} />
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
