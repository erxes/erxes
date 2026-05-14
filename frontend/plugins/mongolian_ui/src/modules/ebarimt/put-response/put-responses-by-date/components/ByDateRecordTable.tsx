import { RecordTable } from 'erxes-ui';
import { ByDateColumns } from '~/modules/ebarimt/put-response/put-responses-by-date/components/ByDateColumn';
import { useByDate } from '~/modules/ebarimt/put-response/put-responses-by-date/hooks/useByDate';
import { BY_DATE_CURSOR_SESSION_KEY } from '~/modules/ebarimt/put-response/put-responses-by-date/constants/ByDateCursorSessionKey';
import { IconShoppingCartX } from '@tabler/icons-react';

export const ByDateRecordTable = () => {
  const { byDate, handleFetchMore, loading, pageInfo } = useByDate();

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
        {!loading && byDate?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No by date
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first by date.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
