import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CmsSidebar } from '../shared/CmsSidebar';
import { CategoriesHeader } from './components/CategoriesHeader';
import { CategoriesRecordTable } from './components/CategoriesRecordTable';
import { useRemoveCategories } from './hooks/useRemoveCategories';
import { ICategory } from './types';
import { CMS_CATEGORY_CONTENT_TYPE } from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

export function Categories() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const { removeBulkCategories } = useRemoveCategories(
    websiteId || '',
    refetch,
  );

  const { openDraft, openDetail } = useContentPanel(CMS_CATEGORY_CONTENT_TYPE);

  const handleAddCategory = () => {
    openDraft({ clientPortalId: websiteId });
  };

  const handleEditCategory = (category: ICategory) => {
    openDetail(category._id);
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
    <PageContainer className="flex-row">
      <CmsSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <CategoriesHeader>{headerActions}</CategoriesHeader>
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
    </PageContainer>
  );
}
