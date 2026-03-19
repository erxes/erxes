import { RecordTable } from 'erxes-ui';
import { usePagesColumns } from './PagesColumn';

import { PagesCommandbar } from './pages-command-bar/PagesCommandBar';
import { PAGES_CURSOR_SESSION_KEY } from '../constants/pagesCursorSessionKey';
import { usePages } from '../hooks/usePages';

interface PagesRecordTableProps {
  clientPortalId: string;
  onEditPage?: (page: any) => void;
}

export const PagesRecordTable = ({
  clientPortalId,
  onEditPage,
}: PagesRecordTableProps) => {
  const { pages, loading, refetch, pageInfo, handleFetchMore } = usePages({
    variables: {
      clientPortalId,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const columns = usePagesColumns(onEditPage, refetch);

  return (
    <RecordTable.Provider
      columns={columns}
      data={pages || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={pages?.length}
        sessionKey={PAGES_CURSOR_SESSION_KEY}
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
      <PagesCommandbar refetch={refetch} />
    </RecordTable.Provider>
  );
};
