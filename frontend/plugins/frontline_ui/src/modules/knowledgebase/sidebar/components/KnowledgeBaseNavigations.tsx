import { IconPlus } from '@tabler/icons-react';
import { Button, NavigationMenuGroup, Sidebar, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { NavigationGroupActions } from '@/NavigationGroupActions';
import { TopicTreeItem } from '@/knowledgebase/sidebar/components/TopicTreeItem';
import { useKnowledgeBaseRoute } from '@/knowledgebase/sidebar/hooks/useKnowledgeBaseRoute';
import { useTopicOpenState } from '@/knowledgebase/sidebar/hooks/useTopicOpenState';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';
import {
  KB_DRAFT_CONTENT_TYPES,
  KB_RECORD_CONTENT_TYPES,
} from '@/knowledgebase/constants';

const TopicTree = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { topics, loading, error } = useTopics();
  const { openRecord, openNewRecord } = useSidePanel();

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
          onAddCategory={(id) =>
            openNewRecord(KB_DRAFT_CONTENT_TYPES.category, { topicId: id })
          }
          onEditCategory={(_id, category) =>
            openRecord({
              contentType: KB_RECORD_CONTENT_TYPES.category,
              contentId: category._id,
            })
          }
        />
      ))}
    </>
  );
};

export const KnowledgeBaseNavigations = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { topicId } = useKnowledgeBaseRoute();
  const { setOpen: openCurrentTopic } = useTopicOpenState(topicId);
  const { openNewRecord } = useSidePanel();
  const [createTopic, setCreateTopic] = useQueryState<string>('createTopic');

  useEffect(() => {
    openCurrentTopic(true);
  }, [openCurrentTopic]);

  useEffect(() => {
    if (createTopic !== 'true') return;

    setCreateTopic(null);
    openNewRecord(KB_DRAFT_CONTENT_TYPES.topic);
  }, [createTopic, setCreateTopic, openNewRecord]);

  return (
    <NavigationMenuGroup
      name={t('knowledge-base', 'Knowledge Base')}
      actions={
        <NavigationGroupActions>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 text-muted-foreground"
            aria-label={t('kb-new-topic', 'New Topic')}
            title={t('kb-new-topic', 'New Topic')}
            onClick={() => openNewRecord(KB_DRAFT_CONTENT_TYPES.topic)}
          >
            <IconPlus />
          </Button>
        </NavigationGroupActions>
      }
    >
      <TopicTree />
    </NavigationMenuGroup>
  );
};
