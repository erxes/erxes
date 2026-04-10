import { RecordTable } from 'erxes-ui';
import {
  firstSpinColumns,
  secondSpinColumns,
} from '@/loyalties/spin/components/SpinColumns';
import { useSpinList } from '@/loyalties/spin/hooks/UseSpinList';
import { IconShoppingCartX } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { SpinCommandBar } from './SpinCommandBar';

export const SpinRecordTable = ({ posId }: { posId?: string }) => {
  const { spinsList, handleFetchMore, loading, pageInfo } = useSpinList({
    posId,
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const allColumns = [...firstSpinColumns, ...secondSpinColumns];
  const columnsKey = allColumns.map((c) => c.id || '').join('|');

  if (loading) return <Spinner />;

  return (
    <RecordTable.Provider
      key={columnsKey}
      columns={allColumns}
      data={spinsList || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'number']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={spinsList?.length}
        sessionKey="spins_cursor"
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
        {!loading && spinsList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No spins yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first spin.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <SpinCommandBar />
    </RecordTable.Provider>
  );
};
