import { RecordTable } from 'erxes-ui';
import { useCoversList } from '@/pos/pos-covers/hooks/UseCoversList';
import { coverColumns } from '@/pos/pos-covers/components/CoverColumns';
import { CoverCommandBar } from '@/pos/pos-covers/components/cover-command-bar/CoverCommandBar';

export const CoversRecordTable = () => {
  const { coversList, handleFetchMore, loading, pageInfo } = useCoversList();

  return (
    <RecordTable.Provider
      columns={coverColumns}
      data={coversList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={coversList?.length}
        sessionKey="covers_cursor"
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
      <CoverCommandBar />
    </RecordTable.Provider>
  );
};
