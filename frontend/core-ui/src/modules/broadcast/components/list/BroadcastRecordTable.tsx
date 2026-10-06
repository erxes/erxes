import { useBroadcastColumns } from '@/broadcast/components/list/BroadcastColumns';
import { useMessages } from '@/broadcast/hooks/useBroadcastMessages';
import { RecordTable } from 'erxes-ui';
import { BroadcastCommandBar } from './BroadcastCommandBar';
import { BroadcastEmptyState, BroadcastErrorState } from './BroadcastStates';

export const BroadcastRecordTable = () => {
  const { messages, pageInfo, loading, error, refetch, handleFetchMore } =
    useMessages();
  const columns = useBroadcastColumns();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (error) {
    return <BroadcastErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!loading && !messages?.length) {
    return <BroadcastEmptyState />;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={messages || []}
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
      <BroadcastCommandBar />
    </RecordTable.Provider>
  );
};
