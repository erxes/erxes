import { RecordTable } from 'erxes-ui';
import { DuplicatedColumns } from '@/put-response/put-responses-duplicated/components/DuplicatedColumn';
import { useDuplicated } from '@/put-response/put-responses-duplicated/hooks/useDuplicated';
import { DUPLICATED_CURSOR_SESSION_KEY } from '@/put-response/put-responses-duplicated/constants/DuplicatedCursorSessionKey';
import { IconShoppingCartX } from '@tabler/icons-react';

export const DuplicatedRecordTable = () => {
  const { putResponsesDuplicated, handleFetchMore, loading, pageInfo } =
    useDuplicated();

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
        {!loading && putResponsesDuplicated?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No duplicated
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first duplicated.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
