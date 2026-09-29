import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CategoriesRecordTable } from '@/knowledgebase/categories/components/CategoriesRecordTable';
import { CategoryDrawer } from '@/knowledgebase/categories/components/CategoryDrawer';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';

export const Categories = () => {
  const { t } = useTranslation('frontline');
  const { topicId = '' } = useParams();
  const { topic } = useTopicDetail(topicId);
  const { categories, refetch } = useCategories(topicId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editId, setEditId] = useQueryState<string>('editId');

  const editing = (categories ?? []).find(
    (category) => category._id === editId,
  );

  const handleClose = () => {
    setIsCreateOpen(false);
    setEditId(null);
  };

  return (
    <KnowledgeBaseLayout
      topicId={topicId}
      topicTitle={topic?.title}
      section="categories"
      actions={
        <Button onClick={() => setIsCreateOpen(true)} className="py-1 h-7">
          <IconPlus />
          {t('kb-new-category', 'New Category')}
          <Kbd>C</Kbd>
        </Button>
      }
    >
      <CategoriesRecordTable
        topicId={topicId}
        onCreate={() => setIsCreateOpen(true)}
      />

      <CategoryDrawer
        key={editing?._id ?? 'create'}
        category={editing}
        topicId={topicId}
        isOpen={isCreateOpen || !!editing}
        onClose={handleClose}
        onSaved={refetch}
      />
    </KnowledgeBaseLayout>
  );
};
