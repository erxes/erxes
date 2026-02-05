import { RecordTable } from 'erxes-ui';
import { putResponseColumns } from '~/modules/ebarimt/put-response/components/PutResponseColumn';
import { PUT_RESPONSE_CURSOR_SESSION_KEY } from '~/modules/ebarimt/put-response/constants/putResponseCursorSessionKey';
import { usePutResponse } from '~/modules/ebarimt/put-response/hooks/usePutResponse';

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
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
