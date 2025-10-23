import { RecordTable } from 'erxes-ui';

import { usePosByItemsList } from '../hooks/UsePosByItemsList';

import { PosByItemsColumns } from './PosByItemsColumn';
import { PosByItemsCommandBar } from './pos-by-items-command-bar/PosByItemsCommandBar';

export const PosByItemsRecordTable = ({ posId }: { posId?: string }) => {
  const { posByItemsList, handleFetchMore, loading, pageInfo } =
    usePosByItemsList({ posId });

  return (
    <RecordTable.Provider
      columns={PosByItemsColumns}
      data={posByItemsList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posByItemsList?.length}
        sessionKey="posByItems_cursor"
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
      <PosByItemsCommandBar />
    </RecordTable.Provider>
  );
};
