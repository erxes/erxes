import { RecordTable } from 'erxes-ui';
import { putResponseColumns } from '@/put-response/components/PutResponseColumn';
import { PUT_RESPONSE_CURSOR_SESSION_KEY } from '@/put-response/constants/putResponseCursorSessionKey';
import { usePutResponse } from '@/put-response/hooks/usePutResponse';
import { IconShoppingCartX } from '@tabler/icons-react';
export const PutResponseRecordTable = () => {
  const { putResponses, handleFetchMore, loading, pageInfo } = usePutResponse();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={putResponseColumns}
      data={putResponses || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={putResponses?.length}
        sessionKey={PUT_RESPONSE_CURSOR_SESSION_KEY}
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
        {!loading && putResponses?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No put response
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first put response.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
