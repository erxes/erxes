import { RecordTable } from 'erxes-ui';
import { createCategoriesColumns } from './CategoriesColumn';
import { CategoriesCommandBar } from './categories-command-bar/CategoriesCommandBar';
import { CATEGORIES_CURSOR_SESSION_KEY } from '../constants/categoriesCursorSessionKey';
import { useCategories } from '../hooks/useCategoriesEnhanced';

interface CategoriesRecordTableProps {
  clientPortalId: string;
  onEdit?: (category: any) => void;
  onRemove?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

export const CategoriesRecordTable = ({
  clientPortalId,
  onEdit,
  onRemove,
  onBulkDelete,
}: CategoriesRecordTableProps) => {
  const { categories, loading, refetch, pageInfo, handleFetchMore } =
    useCategories({
      variables: {
        clientPortalId,
      },
    });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const columns = createCategoriesColumns(
    clientPortalId,
    onEdit || (() => {}),
    refetch,
  );

  return (
    <RecordTable.Provider
      columns={columns}
      data={categories || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={categories?.length}
        sessionKey={CATEGORIES_CURSOR_SESSION_KEY}
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
      {onBulkDelete && <CategoriesCommandBar onBulkDelete={onBulkDelete} />}
    </RecordTable.Provider>
  );
};
