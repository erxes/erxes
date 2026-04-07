import { IconArticle, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { CmsSidebar } from '../shared/CmsSidebar';
import { EmptyState } from '../shared/EmptyState';
import { CmsCategoryDrawer } from './CmsCategoryDrawer';
import { CategoriesHeader } from './components/CategoriesHeader';
import { CategoriesRecordTable } from './components/CategoriesRecordTable';
import { useCategories } from './hooks/useCategories';
import { useRemoveCategories } from './hooks/useRemoveCategories';
import { ICategory } from './types';

export function Categories() {
  const { websiteId } = useParams();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ICategory | undefined
  >(undefined);
  const { confirm } = useConfirm();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { categories, totalCount, loading } = useCategories(websiteId || '');

  useEffect(() => {}, [location]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const { removeSingleCategory, removeBulkCategories } = useRemoveCategories(
    websiteId || '',
    refetch,
  );

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setDrawerOpen(true);
  };

  const handleEditCategory = (category: ICategory) => {
    setSelectedCategory(category);
    setDrawerOpen(true);
  };

  const handleRemoveCategory = async (id: string) => {
    await confirm({ message: 'Delete this category?' });
    await removeSingleCategory(id);
  };

  const handleBulkDelete = async (ids: string[]) => {
    await removeBulkCategories(ids);
  };

  const headerActions = (
    <div>
      <Button onClick={() => setDrawerOpen(true)}>
        <IconPlus />
        Add Categories
        <Kbd>C</Kbd>
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <CategoriesHeader>{headerActions}</CategoriesHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex flex-col w-full overflow-hidden flex-auto">
          <div className="flex pt-2 pl-4 justify-between items-center mb-2">
            <div className="text-sm text-gray-600">
              Found {totalCount} categories
            </div>
          </div>
          {!loading && (!categories || categories.length === 0) ? (
            <div className="rounded-lg overflow-hidden">
              <EmptyState
                icon={IconArticle}
                title="No categories yet"
                description="Get started by creating your first page."
                actionLabel="Add Category"
                onAction={() => setDrawerOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-hidden flex-auto p-3">
              <div className="h-full">
                <CategoriesRecordTable
                  key={refetchTrigger}
                  clientPortalId={websiteId || ''}
                  onEdit={handleEditCategory}
                  onRemove={handleRemoveCategory}
                  onBulkDelete={handleBulkDelete}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <CmsCategoryDrawer
        category={selectedCategory}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCategory(undefined);
        }}
        clientPortalId={websiteId || ''}
        onRefetch={refetch}
      />
    </PageContainer>
  );
}
