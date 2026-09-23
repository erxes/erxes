import { IconLayoutGrid, IconList, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Kbd,
  PageSubHeader,
  ToggleGroup,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { TopicDrawer } from '@/knowledgebase/topics/components/TopicDrawer';
import { TopicsFilter } from '@/knowledgebase/topics/components/TopicsFilter';
import { TopicsGrid } from '@/knowledgebase/topics/components/TopicsGrid';
import { TopicsRecordTable } from '@/knowledgebase/topics/components/TopicsRecordTable';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';

type TTopicsView = 'list' | 'thumbnail';

export const Topics = () => {
  const { t } = useTranslation('frontline');
  const [view, setView] = useState<TTopicsView>('thumbnail');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editId, setEditId] = useQueryState<string>('editId');
  const [createTopic, setCreateTopic] = useQueryState<string>('createTopic');
  const { topics, refetch } = useTopics();

  useEffect(() => {
    if (createTopic !== 'true') return;

    setIsCreateOpen(true);
    setCreateTopic(null);
  }, [createTopic, setCreateTopic]);

  const editing = (topics ?? []).find((topic) => topic._id === editId);

  const handleClose = () => {
    setIsCreateOpen(false);
    setEditId(null);
  };

  return (
    <KnowledgeBaseLayout
      actions={
        <>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => value && setView(value as TTopicsView)}
            size="sm"
          >
            <ToggleGroup.Item
              value="list"
              aria-label={t('kb-list-view', 'List view')}
            >
              <IconList className="size-4" />
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="thumbnail"
              aria-label={t('kb-grid-view', 'Grid view')}
            >
              <IconLayoutGrid className="size-4" />
            </ToggleGroup.Item>
          </ToggleGroup>

          <Button onClick={() => setIsCreateOpen(true)} className="py-1 h-7">
            <IconPlus />
            {t('kb-new-topic', 'New Topic')}
            <Kbd>C</Kbd>
          </Button>
        </>
      }
    >
      <PageSubHeader>
        <TopicsFilter />
      </PageSubHeader>

      {view === 'thumbnail' ? (
        <TopicsGrid
          onCreate={() => setIsCreateOpen(true)}
          onManage={setEditId}
        />
      ) : (
        <TopicsRecordTable onCreate={() => setIsCreateOpen(true)} />
      )}

      <TopicDrawer
        key={editing?._id ?? 'create'}
        topic={editing}
        isOpen={isCreateOpen || !!editing}
        onClose={handleClose}
        onSaved={refetch}
      />
    </KnowledgeBaseLayout>
  );
};
