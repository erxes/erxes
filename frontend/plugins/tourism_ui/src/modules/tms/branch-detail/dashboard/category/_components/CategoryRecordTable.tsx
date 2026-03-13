import { IconLayoutGrid } from '@tabler/icons-react';
import { RecordTable, useMultiQueryState } from 'erxes-ui';
import { CategoryCreateSheet } from './CategoryCreateSheet';
import { categoryColumns } from './CategoryColumns';
import { useCategories } from '../hooks/useCategories';
import { CategoryCommandBar } from './CategoryCommandBar';

export const CategoryRecordTable = () => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const { categories, loading } = useCategories({
    variables: {
      parentId: queries?.searchValue || undefined,
    },
  });

  if (!loading && (categories?.length ?? 0) === 0) {
    return <EmptyStateRow />;
  }

  return (
    <RecordTable.Provider
      columns={categoryColumns}
      data={categories || []}
      className="h-full"
      stickyColumns={['checkbox', 'name']}
    >
      <CategoryCommandBar />
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          {loading && <RecordTable.RowSkeleton rows={10} />}
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};

function EmptyStateRow() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 w-full min-h-[80vh] text-center">
      <IconLayoutGrid
        size={64}
        stroke={1.5}
        className="text-muted-foreground"
      />

      <h2 className="text-lg font-semibold text-muted-foreground">
        No categories yet
      </h2>

      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first category to get started.
      </p>

      <CategoryCreateSheet />
    </div>
  );
}
