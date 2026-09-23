import {
  IconAlertCircle,
  IconBook,
  IconFileText,
  IconFolders,
  IconPencil,
} from '@tabler/icons-react';
import { Button, Empty, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';
import { ITopic } from '@/knowledgebase/types';

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

const TopicCard = ({
  topic,
  onManage,
}: {
  topic: ITopic;
  onManage: (topicId: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const categories = topic.categories ?? [];
  const articleCount = categories.reduce(
    (total, category) => total + (category.numOfArticles ?? 0),
    0,
  );

  return (
    <div className="flex relative flex-col gap-4 p-5 rounded-xl border transition group bg-background hover:border-primary/30 hover:shadow-md">
      <Link
        to={`${KNOWLEDGE_BASE_PATH}/${topic._id}/articles`}
        className="absolute inset-0 rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="sr-only">{topic.title || t('unnamed-topic')}</span>
      </Link>

      <div className="flex gap-3 items-start">
        <span
          className="flex justify-center items-center text-white bg-center bg-cover rounded-lg shrink-0 size-11"
          style={{
            backgroundColor: topic.color || '#4F46E5',
            backgroundImage: topic.backgroundImage
              ? `url(${topic.backgroundImage})`
              : undefined,
          }}
        >
          {!topic.backgroundImage && <IconBook className="size-5" />}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-foreground">
            {topic.title || t('unnamed-topic')}
          </h3>
          <p className="mt-1 text-sm line-clamp-2 text-muted-foreground">
            {topic.description ||
              t('no-description-available', 'No description available')}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative z-10 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
          onClick={() => onManage(topic._id)}
          aria-label={t('manage', 'Manage')}
          title={t('manage', 'Manage')}
        >
          <IconPencil className="size-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center pt-3 mt-auto text-xs border-t text-muted-foreground">
        <span className="flex gap-4 items-center">
          <span
            className="flex gap-1.5 items-center"
            title={t('kb-categories', 'Categories')}
          >
            <IconFolders className="size-3.5" />
            {categories.length}
          </span>
          <span
            className="flex gap-1.5 items-center"
            title={t('articles', 'Articles')}
          >
            <IconFileText className="size-3.5" />
            {articleCount}
          </span>
        </span>
        <span>{formatDate(topic.createdDate)}</span>
      </div>
    </div>
  );
};

export const TopicsGrid = ({
  onCreate,
  onManage,
}: {
  onCreate: () => void;
  onManage: (topicId: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { topics, loading, error } = useTopics();

  if (error) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error')}</Empty.Title>
          <Empty.Description>{error.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  if (loading && !topics) {
    return (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (topics?.length === 0) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconBook />
          </Empty.Media>
          <Empty.Title>
            {t('kb-no-topics-yet', 'There are no topics yet')}
          </Empty.Title>
          <Empty.Description>
            {t(
              'kb-no-topics-description',
              'Create your first topic and start your knowledge base.',
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant="outline" onClick={onCreate}>
            {t('kb-create-topic', 'Create Topic')}
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <div className="overflow-auto flex-auto">
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {(topics ?? []).map((topic) => (
          <TopicCard key={topic._id} topic={topic} onManage={onManage} />
        ))}
      </div>
    </div>
  );
};
