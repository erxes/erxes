import { useSafeRemainders } from '../hooks/useSafeRemainders';
import { safeRemainderColumns } from './SafeRemainderColumns';
import { RecordTable } from 'erxes-ui';

export const SafeRemainderTable = () => {
  const { safeRemainders, loading, totalCount, handleFetchMore } =
    useSafeRemainders();

  return (
    <RecordTable.Provider
      columns={safeRemainderColumns}
      data={safeRemainders || []}
      stickyColumns={[]}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && totalCount > safeRemainders?.length && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
