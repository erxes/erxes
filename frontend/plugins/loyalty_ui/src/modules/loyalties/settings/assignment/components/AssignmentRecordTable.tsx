import { RecordTable } from 'erxes-ui';

import { assignmentColumns } from './AssignmentColumns';
import { AssignmentCommandBar } from './assignment-command-bar/AssignmentCommandBar';
import { useAssignments } from '../hooks/useAssignments';
import { useAssignmentStatusEdit } from '../hooks/useAssignmentStatusEdit';
import { ASSIGNMENTS_CURSOR_SESSION_KEY } from '../constants/assignmentsCursorSessionKey';

import { IconTicket } from '@tabler/icons-react';
import { LoyaltyAssignmentAddSheet } from './AssignmentAddSheet';

export const AssignmentRecordTable = () => {
  const { assignments, handleFetchMore, loading, pageInfo } = useAssignments();
  const { editStatus } = useAssignmentStatusEdit();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={assignmentColumns(editStatus)}
      data={assignments || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'title']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={assignments?.length}
        sessionKey={ASSIGNMENTS_CURSOR_SESSION_KEY}
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
        {!loading && assignments?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconTicket
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">
                    No assignment yet
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first assignment.
                  </p>
                </div>
                <LoyaltyAssignmentAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <AssignmentCommandBar />
    </RecordTable.Provider>
  );
};
