import { RecordTable } from 'erxes-ui';
import { format } from 'date-fns';
import { DuplicatedColumns } from '@/put-responses-duplicated/components/DuplicatedColumn';
import { useDuplicated } from '@/put-responses-duplicated/hooks/useDuplicated';
import { DUPLICATED_CURSOR_SESSION_KEY } from '@/put-responses-duplicated/constants/DuplicatedCursorSessionKey';
import { DuplicatedCommandBar } from '@/put-responses-duplicated/components/duplicated-command-bar/DuplicatedCommandBar';

export const DuplicatedRecordTable = () => {
  const now = new Date();
  const firstDay = format(
    new Date(now.getFullYear(), now.getMonth(), 1),
    'yyyy-MM-dd',
  );
  const lastDay = format(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
    'yyyy-MM-dd',
  );

  const { putResponsesDuplicated, handleFetchMore, loading, pageInfo } =
    useDuplicated({
      variables: {
        createdStartDate: firstDay,
        createdEndDate: lastDay,
      },
    });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={DuplicatedColumns}
      data={putResponsesDuplicated || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', '']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={putResponsesDuplicated?.length || 0}
        sessionKey={DUPLICATED_CURSOR_SESSION_KEY}
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
      </RecordTable.CursorProvider>
      <DuplicatedCommandBar />
    </RecordTable.Provider>
  );
};
