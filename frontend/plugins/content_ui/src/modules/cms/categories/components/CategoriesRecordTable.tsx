import { IconArticle } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { useMemo } from 'react';
import { EmptyState } from '../../shared/EmptyState';
import { createCategoriesColumns } from './CategoriesColumn';

import { useCategories } from '../hooks/useCategoriesEnhanced';
import { CategoriesCommandBar } from './categories-command-bar/CategoriesCommandbar';
import { ICategory } from '@/cms/categories/types';

const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function sortCategoriesAsTree(
  flat: ICategory[],
): (ICategory & { _depth: number })[] {
  const result: (ICategory & { _depth: number })[] = [];
  const visited = new Set<string>();

  const addWithChildren = (cat: ICategory, depth: number) => {
    if (visited.has(cat._id)) return;
    visited.add(cat._id);
    result.push({ ...cat, _depth: depth });
    flat
      .filter((c) => c.parentId === cat._id)
      .sort((a, b) => naturalSort(a.name || '', b.name || ''))
      .forEach((child) => addWithChildren(child, depth + 1));
  };

  flat
    .filter((c) => !c.parentId)
    .sort((a, b) => naturalSort(a.name || '', b.name || ''))
    .forEach((root) => addWithChildren(root, 0));
  flat.forEach((c) => {
    if (!visited.has(c._id)) result.push({ ...c, _depth: 0 });
  });

  return result;
}

interface CategoriesRecordTableProps {
  clientPortalId: string;
  onAdd?: () => void;
  onEdit?: (category: any) => void;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

export const CategoriesRecordTable = ({
  clientPortalId,
  onAdd,
  onEdit,
  onBulkDelete,
}: CategoriesRecordTableProps) => {
  const { categories, totalCount, loading, refetch, pageInfo, handleFetchMore } =
    useCategories({
      variables: {
        clientPortalId,
      },
    });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const treeCategories = useMemo(
    () => sortCategoriesAsTree(categories || []),
    [categories],
  );

  const columns = createCategoriesColumns(
    clientPortalId,
    onEdit,
    refetch,
  );

  return (
    <>
      {!loading && categories.length === 0 ? (
        <div className="rounded-lg overflow-hidden">
          <EmptyState
            icon={IconArticle}
            title="No categories yet"
            description="Get started by creating your first category."
            actionLabel="Add Category"
            onAction={onAdd}
          />
        </div>
      ) : (
        <>
          {!loading && categories.length > 0 && (
            <div className="flex pt-2 pl-4 justify-between items-center mb-2">
              <div className="text-sm text-gray-600">
                Found {totalCount} categories
              </div>
            </div>
          )}
          <div className="overflow-hidden flex-auto p-3">
            <div className="h-full">
              <RecordTable.Provider
                columns={columns}
                data={treeCategories}
                className="h-full"
                stickyColumns={['more', 'checkbox', 'name']}
              >
                <RecordTable.CursorProvider
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                  dataLength={categories?.length}
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
                {onBulkDelete && (
                  <CategoriesCommandBar onBulkDelete={onBulkDelete} />
                )}
              </RecordTable.Provider>
            </div>
          </div>
        </>
      )}
    </>
  );
};
