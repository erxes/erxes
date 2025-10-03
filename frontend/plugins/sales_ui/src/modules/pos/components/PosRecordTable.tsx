import { RecordTable } from 'erxes-ui';
import { PosCommandBar } from './pos-command-bar/PosCommandBar';
import { usePosList } from '../hooks/usePosList';
import { posColumns } from './columns';

export const PosRecordTable = () => {
  const { posList, handleFetchMore, loading, pageInfo } = usePosList();

  return (
    <RecordTable.Provider
      columns={posColumns}
      data={posList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posList?.length}
        sessionKey="pos_cursor"
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
      <PosCommandBar />
    </RecordTable.Provider>
  );
};
