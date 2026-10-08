import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader, useQueryState } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ArticleDrawer } from '@/knowledgebase/articles/components/ArticleDrawer';
import { ArticlesFilter } from '@/knowledgebase/articles/components/ArticlesFilter';
import { ArticlesRecordTable } from '@/knowledgebase/articles/components/ArticlesRecordTable';
import { useArticles } from '@/knowledgebase/articles/hooks/useArticles';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { useKbCreateHotkey } from '@/knowledgebase/shared/hooks/useKbCreateHotkey';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';

export const Articles = () => {
  const { t } = useTranslation('frontline');
  const { topicId = '' } = useParams();
  const { topic } = useTopicDetail(topicId);
  const { categories } = useCategories(topicId, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });
  const { refetch } = useArticles(topicId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editId, setEditId] = useQueryState<string>('editId');
  const [categoryId] = useQueryState<string>('categoryId');
  const [createArticle, setCreateArticle] =
    useQueryState<string>('createArticle');

  const defaultCategoryId = categoryId || categories?.[0]?._id || '';
  const canCreate = !!defaultCategoryId;

  useEffect(() => {
    if (createArticle !== 'true' || !canCreate) return;

    setIsCreateOpen(true);
    setCreateArticle(null);
  }, [createArticle, canCreate, setCreateArticle]);

  useKbCreateHotkey({
    scope: KnowledgeBaseHotKeyScope.ArticlesPage,
    isSheetOpen: isCreateOpen || !!editId,
    onCreate: () => canCreate && setIsCreateOpen(true),
  });

  const handleClose = () => {
    setIsCreateOpen(false);
    setEditId(null);
  };

  return (
    <KnowledgeBaseLayout
      topicId={topicId}
      topicTitle={topic?.title}
      section="articles"
      actions={
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="py-1 h-7"
          disabled={!canCreate}
        >
          <IconPlus />
          {t('kb-new-article', 'New Article')}
          <Kbd>C</Kbd>
        </Button>
      }
    >
      <PageSubHeader>
        <ArticlesFilter topicId={topicId} />
      </PageSubHeader>

      <ArticlesRecordTable
        topicId={topicId}
        canCreate={canCreate}
        onCreate={() => setIsCreateOpen(true)}
      />

      <ArticleDrawer
        key={editId ?? 'create'}
        articleId={editId}
        topicId={topicId}
        categoryId={defaultCategoryId}
        isOpen={isCreateOpen || !!editId}
        onClose={handleClose}
        onSaved={refetch}
      />
    </KnowledgeBaseLayout>
  );
};
