import { IconLayoutGrid } from '@tabler/icons-react';
import { RecordTable, RecordTableTree } from 'erxes-ui';
import { CategoryCreateSheet } from './CategoryCreateSheet';
import { categoryColumns } from './CategoryColumns';
import { useCategories } from '../hooks/useCategories';
import { CategoryCommandBar } from './CategoryCommandBar';
import { useMemo } from 'react';
import { ICategory } from '../types/category';

export const CategoryRecordTable = ({ branchId }: { branchId?: string }) => {
  const { categories, loading } = useCategories({
    variables: { branchId },
  });

  const categoriesWithChildren = categories?.map((category: ICategory) => ({
    ...category,
    hasChildren: categories?.some(
      (c: ICategory) => c.parentId === category._id,
    ),
  }));

  const categoryObject = useMemo(() => {
    return categoriesWithChildren?.reduce(
      (acc: Record<string, ICategory>, category: ICategory) => {
        acc[category._id] = category;
        return acc;
      },
      {},
    );
  }, [categoriesWithChildren]);

  if (!loading && (categories?.length ?? 0) === 0) {
    return <EmptyStateRow branchId={branchId} />;
  }

  return (
    <RecordTable.Provider
      columns={categoryColumns(categoryObject)}
      data={categoriesWithChildren || []}
      className="h-full"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTableTree id="tour-categories" ordered>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList Row={RecordTableTree.Row} />
              {loading && <RecordTable.RowSkeleton rows={10} />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTableTree>
      <CategoryCommandBar />
    </RecordTable.Provider>
  );
};

function EmptyStateRow({ branchId }: { branchId?: string }) {
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

      <CategoryCreateSheet branchId={branchId} />
    </div>
  );
}
