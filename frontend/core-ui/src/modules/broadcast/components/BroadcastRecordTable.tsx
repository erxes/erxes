import { broadcastColumns } from '@/broadcast/components/BroadcastColumns';
import { useMessages } from '@/broadcast/hooks/useBroadcastMessages';
import { RecordTable } from 'erxes-ui';

export const BroadcastRecordTable = () => {
  const { messages, pageInfo, loading, handleFetchMore } = useMessages();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={broadcastColumns}
      data={messages || [{}]}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={messages?.length}
        sessionKey={'broadcast-cursor'}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}

            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
