import { RecordTable, Spinner } from 'erxes-ui';
import { IconClipboardList } from '@tabler/icons-react';
import { assignmentColumns } from './AssignmentColumns';
import {
  useAssignmentList,
  ASSIGNMENT_CURSOR_SESSION_KEY,
} from '../hooks/useAssignmentList';
import { AssignmentCommandBar } from './AssignmentCommandBar';
import { AssignmentAddModal } from './AssignmentAddModal';

export const AssignmentRecordTable = () => {
  const { list, handleFetchMore, loading, pageInfo } = useAssignmentList();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (loading && !list?.length) return <Spinner />;

  return (
    <RecordTable.Provider
      columns={assignmentColumns}
      data={list || []}
      className="m-3"
      stickyColumns={['checkbox', 'campaign']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list?.length}
        sessionKey={ASSIGNMENT_CURSOR_SESSION_KEY}
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
        {!loading && list?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconClipboardList size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No assignments yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Get started by creating your first assignment.
              </p>
              <AssignmentAddModal />
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <AssignmentCommandBar />
    </RecordTable.Provider>
  );
};
