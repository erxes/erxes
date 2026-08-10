import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CmsSidebar } from '../shared/CmsSidebar';
import { CmsCategoryDrawer } from './CmsCategoryDrawer';
import { CategoriesHeader } from './components/CategoriesHeader';
import { CategoriesRecordTable } from './components/CategoriesRecordTable';
import { useRemoveCategories } from './hooks/useRemoveCategories';
import { ICategory } from './types';

export function Categories() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ICategory | undefined
  >(undefined);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const { removeBulkCategories } = useRemoveCategories(
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

  const handleBulkDelete = async (ids: string[]) => {
    await removeBulkCategories(ids);
  };

  const headerActions = (
    <div>
      <Button onClick={handleAddCategory}>
        <IconPlus />
        {t('add-categories')}
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
          <CategoriesRecordTable
            key={refetchTrigger}
            clientPortalId={websiteId || ''}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onBulkDelete={handleBulkDelete}
          />
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
