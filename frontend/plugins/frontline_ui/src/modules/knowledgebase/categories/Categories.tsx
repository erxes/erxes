import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CategoriesRecordTable } from '@/knowledgebase/categories/components/CategoriesRecordTable';
import {
  KB_RECORD_CONTENT_TYPES,
  KB_DRAFT_CONTENT_TYPES,
} from '@/knowledgebase/constants';
import { KnowledgeBaseDetailLink } from '@/knowledgebase/shared/components/KnowledgeBaseDetailLink';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { useKbCreateHotkey } from '@/knowledgebase/shared/hooks/useKbCreateHotkey';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import { KnowledgeBaseHotKeyScope } from '@/knowledgebase/types';
import { useSidePanel } from 'ui-modules';

export const Categories = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { topicId = '' } = useParams();
  const { topic } = useTopicDetail(topicId);
  const { record, openNewRecord } = useSidePanel();
  const openCreate = () =>
    openNewRecord(KB_DRAFT_CONTENT_TYPES.category, { topicId });

  useKbCreateHotkey({
    scope: KnowledgeBaseHotKeyScope.CategoriesPage,
    isSheetOpen: !!record,
    onCreate: openCreate,
  });

  return (
    <KnowledgeBaseLayout
      topicId={topicId}
      topicTitle={topic?.title ?? undefined}
      section="categories"
      actions={
        <Button onClick={openCreate} className="py-1 h-7">
          <IconPlus />
          {t('kb-new-category', 'New Category')}
          <Kbd>C</Kbd>
        </Button>
      }
    >
      <CategoriesRecordTable topicId={topicId} onCreate={openCreate} />

      <KnowledgeBaseDetailLink contentType={KB_RECORD_CONTENT_TYPES.category} />
    </KnowledgeBaseLayout>
  );
};
