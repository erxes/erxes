import { IconPuzzle } from '@tabler/icons-react';
import { RecordTable, useMultiQueryState } from 'erxes-ui';
import { ElementCreateSheet } from './ElementCreateSheet';
import { elementColumns } from './ElementColumns';
import { useElements } from '../hooks/useElements';
import { useElementCategories } from '../hooks/useElementCategories';
import { ELEMENTS_CURSOR_SESSION_KEY } from '../constants/elementCursorSessionKey';
import { ElementCommandBar } from './ElementCommandBar';

export const ElementRecordTable = ({ branchId }: { branchId: string }) => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    categoryId: string;
  }>(['searchValue', 'categoryId']);

  const { elements, handleFetchMore, loading, pageInfo, totalCount } =
    useElements({
      variables: {
        branchId,
        name: queries?.searchValue || undefined,
        categories: queries?.categoryId ? [queries.categoryId] : undefined,
      },
    });
  const { getCategoryNamesByIds } = useElementCategories();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (!loading && (totalCount ?? 0) === 0) {
    return <EmptyStateRow branchId={branchId} />;
  }

  return (
    <RecordTable.Provider
      columns={elementColumns(getCategoryNamesByIds)}
      data={elements || []}
      className="h-full"
      stickyColumns={['checkbox', 'name']}
    >
      <ElementCommandBar />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={elements?.length}
        sessionKey={ELEMENTS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={30} />}
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

function EmptyStateRow({ branchId }: { branchId: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconPuzzle size={64} stroke={1.5} className="text-muted-foreground" />

      <h2 className="text-lg font-semibold text-muted-foreground">
        No elements yet
      </h2>

      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first element to get started.
      </p>

      <ElementCreateSheet branchId={branchId} />
    </div>
  );
}
