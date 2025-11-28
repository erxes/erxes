import { RecordTable } from 'erxes-ui';
import { format } from 'date-fns';
import { ByDateColumns } from '@/put-responses-by-date/components/ByDateColumn';
import { ByDateCommandBar } from '@/put-responses-by-date/components/by-date-command-bar/ByDateCommandBar';
import { useByDate } from '@/put-responses-by-date/hooks/useByDate';
import { BY_DATE_CURSOR_SESSION_KEY } from '@/put-responses-by-date/constants/ByDateCursorSessionKey';

export const ByDateRecordTable = () => {
  const now = new Date();
  const firstDay = format(
    new Date(now.getFullYear(), now.getMonth(), 1),
    'yyyy-MM-dd',
  );
  const lastDay = format(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
    'yyyy-MM-dd',
  );

  const { byDate, handleFetchMore, loading, pageInfo } = useByDate({
    variables: {
      createdStartDate: firstDay,
      createdEndDate: lastDay,
    },
  });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={ByDateColumns}
      data={byDate || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', '']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={byDate?.length || 0}
        sessionKey={BY_DATE_CURSOR_SESSION_KEY}
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
      <ByDateCommandBar />
    </RecordTable.Provider>
  );
};
