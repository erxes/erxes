import { IconPlus } from '@tabler/icons-react';
import { Button, Sidebar, useQueryState } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryDrawer } from '@/knowledgebase/categories/components/CategoryDrawer';
import { TopicTreeItem } from '@/knowledgebase/sidebar/components/TopicTreeItem';
import { useKnowledgeBaseRoute } from '@/knowledgebase/sidebar/hooks/useKnowledgeBaseRoute';
import { useTopicOpenState } from '@/knowledgebase/sidebar/hooks/useTopicOpenState';
import { TopicDrawer } from '@/knowledgebase/topics/components/TopicDrawer';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';
import { ICategory, ITopic } from '@/knowledgebase/types';

type TCategoryDraft = {
  topicId: string;
  category?: ICategory;
};

const TopicTree = ({
  topics,
  loading,
  error,
  onAddCategory,
  onEditCategory,
}: {
  topics?: ITopic[];
  loading: boolean;
  error?: { message: string };
  onAddCategory: (topicId: string) => void;
  onEditCategory: (topicId: string, category: ICategory) => void;
}) => {
  const { t } = useTranslation('frontline');

  if (loading && !topics) {
    return (
      <>
        {Array.from({ length: 5 }, (_, index) => (
          <Sidebar.MenuItem key={index}>
            <Sidebar.MenuSkeleton />
          </Sidebar.MenuItem>
        ))}
      </>
    );
  }

  if (error) {
    return <p className="px-2 text-sm text-destructive">{error.message}</p>;
  }

  if (!topics?.length) {
    return (
      <p className="px-2 text-sm text-muted-foreground">
        {t('kb-no-topics-yet', 'There are no topics yet')}
      </p>
    );
  }

  return (
    <>
      {topics.map((topic) => (
        <TopicTreeItem
          key={topic._id}
          topic={topic}
          onAddCategory={onAddCategory}
          onEditCategory={onEditCategory}
        />
      ))}
    </>
  );
};

export const KnowledgeBaseSidebar = () => {
  const { t } = useTranslation('frontline');
  const { topicId } = useKnowledgeBaseRoute();
  const { setOpen: openCurrentTopic } = useTopicOpenState(topicId);
  const { topics, loading, error } = useTopics();
  const [createTopic, setCreateTopic] = useQueryState<string>('createTopic');
  const [isTopicCreateOpen, setIsTopicCreateOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState<TCategoryDraft>();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  const openCategoryDrawer = (draft: TCategoryDraft) => {
    setCategoryDraft(draft);
    setIsCategoryDrawerOpen(true);
  };

  useEffect(() => {
    openCurrentTopic(true);
  }, [openCurrentTopic]);

  useEffect(() => {
    if (createTopic !== 'true') return;

    setIsTopicCreateOpen(true);
    setCreateTopic(null);
  }, [createTopic, setCreateTopic]);

  return (
    <Sidebar collapsible="none" className="flex-none w-64 border-r">
      <Sidebar.Content>
        <Sidebar.Group>
          <div className="flex justify-between items-center w-full">
            <Sidebar.GroupLabel>
              {`${t('kb-knowledge-bases', 'Knowledge bases')} (${
                topics?.length ?? 0
              })`}
            </Sidebar.GroupLabel>
            <Button
              variant="ghost"
              className="text-xs font-semibold text-accent-foreground"
              aria-label={t('kb-new-topic', 'New Topic')}
              onClick={() => setIsTopicCreateOpen(true)}
            >
              <IconPlus />
            </Button>
          </div>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <TopicTree
                topics={topics}
                loading={loading}
                error={error}
                onAddCategory={(id) => openCategoryDrawer({ topicId: id })}
                onEditCategory={(id, category) =>
                  openCategoryDrawer({ topicId: id, category })
                }
              />
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>

      <TopicDrawer
        isOpen={isTopicCreateOpen}
        onClose={() => setIsTopicCreateOpen(false)}
      />

      <CategoryDrawer
        key={categoryDraft?.category?._id ?? categoryDraft?.topicId}
        topicId={categoryDraft?.topicId ?? ''}
        category={categoryDraft?.category}
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />
    </Sidebar>
  );
};
