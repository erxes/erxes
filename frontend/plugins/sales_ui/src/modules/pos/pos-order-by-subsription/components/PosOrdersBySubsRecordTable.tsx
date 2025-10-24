import { RecordTable } from 'erxes-ui';
import { PosOrdersBySubsCommandBar } from './pos-order-by-subs-command-bar/PosOrderBySubsCommandBar';

import { PosOrdersBySubsColumns } from './PosOrdersBySubsColumns';
import { usePosOrderBySubsriptionList } from '../hooks/UsePosOrderBySubsriptionList';

export const PosOrdersBySubsRecordTable = ({ posId }: { posId?: string }) => {
  const { posOrderBySubsriptionList, handleFetchMore, loading, pageInfo } =
    usePosOrderBySubsriptionList({ posId });

  return (
    <RecordTable.Provider
      columns={PosOrdersBySubsColumns}
      data={posOrderBySubsriptionList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posOrderBySubsriptionList?.length}
        sessionKey="posOrdersBySubs_cursor"
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
      <PosOrdersBySubsCommandBar />
    </RecordTable.Provider>
  );
};
