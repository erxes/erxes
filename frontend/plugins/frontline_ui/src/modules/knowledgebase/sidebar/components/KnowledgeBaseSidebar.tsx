import { IconPlus } from '@tabler/icons-react';
import { Button, cn, Separator, Sidebar, useQueryState } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryDrawer } from '@/knowledgebase/categories/components/CategoryDrawer';
import { KbResizeHandle } from '@/knowledgebase/sidebar/components/KbResizeHandle';
import { TopicTreeItem } from '@/knowledgebase/sidebar/components/TopicTreeItem';
import { useKnowledgeBaseRoute } from '@/knowledgebase/sidebar/hooks/useKnowledgeBaseRoute';
import { useTopicOpenState } from '@/knowledgebase/sidebar/hooks/useTopicOpenState';
import {
  kbSidebarResizingAtom,
  kbSidebarWidthAtom,
} from '@/knowledgebase/sidebar/states/kbSidebarWidthState';
import { TopicDrawer } from '@/knowledgebase/topics/components/TopicDrawer';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';
import { ICategoryFields, ITopic } from '@/knowledgebase/types';

type TCategoryDraft = {
  topicId: string;
  category?: ICategoryFields;
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
  onEditCategory: (topicId: string, category: ICategoryFields) => void;
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
  const panelRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useAtom(kbSidebarWidthAtom);
  const resizing = useAtomValue(kbSidebarResizingAtom);

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
    <Sidebar.Panel
      ref={panelRef}
      className={cn('flex-none border-r', resizing && 'transition-none')}
      style={width ? { width } : undefined}
    >
      <div className="flex gap-1 items-center px-2 h-10 shrink-0">
        <span className="block flex-1 px-2 min-w-0 text-sm font-medium truncate">
          {t('knowledge-base', 'Knowledge Base')}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label={t('kb-new-topic', 'New Topic')}
          title={t('kb-new-topic', 'New Topic')}
          onClick={() => setIsTopicCreateOpen(true)}
        >
          <IconPlus />
        </Button>
        <Sidebar.PanelTrigger className="size-8" />
      </div>
      <Separator className="flex-none w-auto" />
      <Sidebar.Group>
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

      <KbResizeHandle
        panelRef={panelRef}
        onResize={setWidth}
        onReset={() => setWidth(null)}
      />

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
    </Sidebar.Panel>
  );
};
