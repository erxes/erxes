import { Button, RecordTable } from 'erxes-ui';
import { PosCommandBar } from './pos-command-bar/PosCommandBar';
import { usePosList } from '../hooks/usePosList';
import { posColumns } from './columns';
import { Link } from 'react-router-dom';
import {
  IconBrandTrello,
  IconSettings,
  IconShoppingCartX,
} from '@tabler/icons-react';

export const PosRecordTable = () => {
  const { posList, handleFetchMore, loading, pageInfo } = usePosList();

  if (!posList || posList.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 gap-2">
        <IconBrandTrello size={64} stroke={1.5} className="text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-600">No stages yet</h2>
        <p className="text-md text-gray-500 mb-4">
          Create a stage to start organizing your board.
        </p>
        <Button variant="outline" asChild>
          <Link to={'/settings'}>
            <IconSettings />
            Go to settings
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <RecordTable.Provider
      columns={posColumns}
      data={posList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={posList?.length}
        sessionKey="pos_cursor"
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
      <PosCommandBar />
    </RecordTable.Provider>
  );
};
