import { RecordTable, Spinner } from 'erxes-ui';
import { agentColumns } from './AgentColumns';
import { useAgentList } from '../hooks/useAgentList';
import { IconUsers } from '@tabler/icons-react';
import { AgentCommandBar } from './AgentCommandBar';

export const AgentRecordTable = () => {
  const { agentList, handleFetchMore, loading, pageInfo } = useAgentList();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (loading && !agentList?.length) return <Spinner />;

  return (
    <RecordTable.Provider
      columns={agentColumns}
      data={agentList || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'number']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={agentList?.length}
        sessionKey="agents_cursor"
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
        {!loading && agentList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconUsers size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No agents yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first agent.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <AgentCommandBar />
    </RecordTable.Provider>
  );
};
