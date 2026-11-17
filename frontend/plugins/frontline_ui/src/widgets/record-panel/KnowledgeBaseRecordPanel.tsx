import { useQuery } from '@apollo/client';
import { Empty, Skeleton, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IRecordPanelProps, useSidePanel } from 'ui-modules';
import { ArticleDrawer } from '@/knowledgebase/articles/components/ArticleDrawer';
import { ArticleMediaSlot } from '@/knowledgebase/articles/components/ArticleMediaSlot';
import { useArticleDetail } from '@/knowledgebase/articles/hooks/useArticles';
import { useArticleTopicId } from '@/knowledgebase/articles/hooks/useArticleTopicId';
import { CategoryDrawer } from '@/knowledgebase/categories/components/CategoryDrawer';
import {
  ARTICLE_MEDIA_TAB,
  KB_RECORD_CONTENT_TYPES,
  KB_DRAFT_CONTENT_TYPES,
} from '@/knowledgebase/constants';
import { CATEGORY_DETAIL } from '@/knowledgebase/graphql/queries';
import {
  KbRecordActions,
  TKbRecordKind,
} from '@/knowledgebase/shared/components/KbRecordActions';
import { useKbPanelCreatePlacement } from '@/knowledgebase/shared/hooks/useKbPanelCreatePlacement';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import { TopicDrawer } from '@/knowledgebase/topics/components/TopicDrawer';
import type { IArticleDetail } from '@/knowledgebase/types';

const KnowledgeBasePanelView = ({
  kind,
  record,
  loading,
  error,
  view,
  contentId,
  topicId,
  article,
  children,
}: {
  kind: TKbRecordKind;
  record?: { _id: string; title?: string | null };
  loading: boolean;
  error?: Error;
  view: IRecordPanelProps['view'];
  contentId: string;
  topicId: string;
  article?: IArticleDetail;
  children: ReactNode;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });

  if (view === 'title') {
    return loading && !record ? (
      <Skeleton className="h-4 w-32" />
    ) : (
      record?.title || t('knowledge-base', 'Knowledge Base')
    );
  }
  if (view === 'actions') {
    return record ? (
      <KbRecordActions
        kind={kind}
        id={contentId}
        title={record.title}
        topicId={topicId}
        article={article}
      />
    ) : null;
  }
  if (loading && !record) return <Spinner containerClassName="py-12" />;
  if (!record) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Title>{t('knowledge-base', 'Knowledge Base')}</Empty.Title>
            <Empty.Description>
              {error?.message ||
                t('not-found', {
                  keyPrefix: '',
                  defaultValue: 'Record not found',
                })}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }
  if (view === 'activity') {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Title>{t('activity', 'Activity')}</Empty.Title>
            <Empty.Description>
              {t(
                'kb-activity-unavailable',
                'Activity history is not available for knowledge base records.',
              )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }
  return children;
};

const ArticlePanel = (props: IRecordPanelProps) => {
  const { article, loading, error } = useArticleDetail(props.contentId);
  const { close } = useSidePanel();
  const {
    topicId,
    loading: placementLoading,
    error: placementError,
  } = useArticleTopicId(article);

  return (
    <KnowledgeBasePanelView
      {...props}
      kind="article"
      record={placementLoading && !topicId ? undefined : article}
      article={article}
      topicId={topicId}
      loading={loading || placementLoading}
      error={error || placementError}
    >
      {article &&
        (props.view === 'tab' && props.tab === ARTICLE_MEDIA_TAB ? (
          <ArticleMediaSlot key={article._id} articleId={article._id} />
        ) : (
          <ArticleDrawer
            key={article._id}
            articleId={article._id}
            article={article}
            topicId={topicId}
            categoryId={article.categoryId || ''}
            mediaTab
            onClose={close}
          />
        ))}
    </KnowledgeBasePanelView>
  );
};

const TopicPanel = (props: IRecordPanelProps) => {
  const { topic, loading, error } = useTopicDetail(props.contentId);
  const { close } = useSidePanel();

  return (
    <KnowledgeBasePanelView
      {...props}
      kind="topic"
      record={topic}
      topicId={props.contentId}
      loading={loading}
      error={error}
    >
      {topic && <TopicDrawer key={topic._id} topic={topic} onClose={close} />}
    </KnowledgeBasePanelView>
  );
};

const CategoryPanel = (props: IRecordPanelProps) => {
  const { data, loading, error } = useQuery(CATEGORY_DETAIL, {
    variables: { _id: props.contentId },
    fetchPolicy: 'cache-and-network',
  });
  const { close } = useSidePanel();
  const category = data?.knowledgeBaseCategoryDetail ?? undefined;
  const topicId = category?.firstTopic?._id || '';

  return (
    <KnowledgeBasePanelView
      {...props}
      kind="category"
      record={category}
      topicId={topicId}
      loading={loading}
      error={error}
    >
      {category && (
        <CategoryDrawer
          key={category._id}
          category={category}
          topicId={topicId}
          onClose={close}
        />
      )}
    </KnowledgeBasePanelView>
  );
};

const KnowledgeBasePanelNew = ({ contentType }: IRecordPanelProps) => {
  const draft = useKbPanelCreatePlacement(contentType);
  const { back, canGoBack, close } = useSidePanel();
  const onClose = () => (canGoBack ? back() : close());

  if (
    contentType === KB_DRAFT_CONTENT_TYPES.article ||
    contentType === KB_RECORD_CONTENT_TYPES.article
  )
    return (
      <ArticleDrawer
        topicId={draft.topicId || ''}
        categoryId={draft.categoryId || ''}
        onClose={onClose}
      />
    );
  if (
    contentType === KB_DRAFT_CONTENT_TYPES.category ||
    contentType === KB_RECORD_CONTENT_TYPES.category
  )
    return <CategoryDrawer topicId={draft.topicId || ''} onClose={onClose} />;
  return <TopicDrawer onClose={onClose} />;
};

export const KnowledgeBaseRecordPanel = (props: IRecordPanelProps) => {
  if (props.view === 'new') return <KnowledgeBasePanelNew {...props} />;
  if (props.contentType === KB_RECORD_CONTENT_TYPES.article)
    return <ArticlePanel {...props} />;
  if (props.contentType === KB_RECORD_CONTENT_TYPES.topic)
    return <TopicPanel {...props} />;
  if (props.contentType === KB_RECORD_CONTENT_TYPES.category)
    return <CategoryPanel {...props} />;
  return null;
};
