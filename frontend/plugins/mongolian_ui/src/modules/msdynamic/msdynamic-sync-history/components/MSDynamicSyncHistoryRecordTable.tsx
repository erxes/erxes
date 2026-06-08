import { IconInbox } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { msDynamicSyncHistoryColumns } from './MSDynamicSyncHistoryColumns';
import { useMSDynamicSyncHistory } from '../hooks/useMSDynamicSyncHistory';

export const MSDynamicSyncHistoryRecordTable = () => {
  const { syncHistories, handleFetchMore, loading, pageInfo } =
    useMSDynamicSyncHistory();
  const { sessionKey } = useMSDynamicSessionKey('syncHistory');

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={msDynamicSyncHistoryColumns}
      data={syncHistories || []}
      className="m-3"
      stickyColumns={['checkbox', 'createdAt']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={syncHistories?.length}
        sessionKey={sessionKey}
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
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-muted-foreground">
              <IconInbox size={64} className="mx-auto mb-4 opacity-70" />
              <h3 className="text-xl font-semibold mb-2">No sync yet</h3>
              <p className="max-w-md">There is no data</p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
