import { RecordTable } from 'erxes-ui';
import { PosOrdersBySubsCommandBar } from '@/pos/pos-order-by-subsription/components/pos-order-by-subs-command-bar/PosOrderBySubsCommandBar';
import { PosOrdersBySubsColumns } from '@/pos/pos-order-by-subsription/components/PosOrdersBySubsColumns';
import { usePosOrderBySubscriptionList } from '@/pos/pos-order-by-subsription/hooks/UsePosOrderBySubsriptionList';

export const PosOrdersBySubsRecordTable = ({ posId }: { posId?: string }) => {
  const { posOrderBySubsriptionList, handleFetchMore, loading, pageInfo } =
    usePosOrderBySubscriptionList({ posId });

  return (
    <RecordTable.Provider
      columns={PosOrdersBySubsColumns}
      data={posOrderBySubsriptionList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'group']}
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
