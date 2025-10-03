import { RecordTable } from 'erxes-ui';
import { useGetCycles } from '@/cycle/hooks/useGetCycles';
import { CYCLES_CURSOR_SESSION_KEY } from '@/cycle/constants';
import { cyclesColumns } from '@/cycle/components/CyclesColumns';

export const CyclesRecordTable = () => {
  const { cycles, handleFetchMore, pageInfo, loading } = useGetCycles();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <RecordTable.Provider
        columns={cyclesColumns}
        data={cycles || [{}]}
        className="m-3 h-full"
        stickyColumns={['checkbox', 'name']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={cycles?.length}
          sessionKey={CYCLES_CURSOR_SESSION_KEY}
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
      </RecordTable.Provider>
    </div>
  );
};
