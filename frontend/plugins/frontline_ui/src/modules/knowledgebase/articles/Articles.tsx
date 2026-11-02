import { useSidePanel } from 'ui-modules';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ArticlesFilter } from '@/knowledgebase/articles/components/ArticlesFilter';
import { ArticlesRecordTable } from '@/knowledgebase/articles/components/ArticlesRecordTable';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import { KnowledgeBaseDetailLink } from '@/knowledgebase/shared/components/KnowledgeBaseDetailLink';
import { useKbCreateHotkey } from '@/knowledgebase/shared/hooks/useKbCreateHotkey';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';
import {
  KB_RECORD_CONTENT_TYPES,
  KB_DRAFT_CONTENT_TYPES,
} from '@/knowledgebase/constants';

export const Articles = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { topicId = '' } = useParams();
  const { topic } = useTopicDetail(topicId);
  const { categories } = useCategories(topicId);
  const { openNewRecord, record } = useSidePanel();
  const [categoryId] = useQueryState<string>('categoryId');

  const defaultCategoryId = categoryId || categories?.[0]?._id || '';
  const canCreate = !!defaultCategoryId;

  const openCreate = () => {
    if (!canCreate) return;
    openNewRecord(KB_DRAFT_CONTENT_TYPES.article, {
      topicId,
      categoryId: defaultCategoryId,
    });
  };

  useKbCreateHotkey({
    scope: KnowledgeBaseHotKeyScope.ArticlesPage,
    isSheetOpen: !!record,
    onCreate: openCreate,
  });

  return (
    <KnowledgeBaseLayout
      topicId={topicId}
      topicTitle={topic?.title ?? undefined}
      section="articles"
      actions={
        <Button onClick={openCreate} className="py-1 h-7" disabled={!canCreate}>
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
        onCreate={openCreate}
      />

      <KnowledgeBaseDetailLink contentType={KB_RECORD_CONTENT_TYPES.article} />
    </KnowledgeBaseLayout>
  );
};
