import { RecordTable } from 'erxes-ui';
import { PosItemsCommandBar } from './pos-items-command-bar/PosItemsCommandBar';
import { PosItemColumns } from './PosItemColumns';
import { usePosItemsList } from '@/pos/pos-items/hooks/UsePosItemsList';

export const PosItemsRecordTable = ({ posId }: { posId?: string }) => {
  const { posItemList, handleFetchMore, loading, pageInfo } = usePosItemsList({
    posId,
  });

  return (
    <RecordTable.Provider
      columns={PosItemColumns}
      data={posItemList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'number']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posItemList?.length}
        sessionKey="posItem_cursor"
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
      <PosItemsCommandBar />
    </RecordTable.Provider>
  );
};
