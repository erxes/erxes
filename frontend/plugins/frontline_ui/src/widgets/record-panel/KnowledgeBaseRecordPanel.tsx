import { useQuery } from '@apollo/client';
import {
  IconCopy,
  IconCode,
  IconDotsVertical,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  DropdownMenu,
  Empty,
  ScrollArea,
  Skeleton,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useFrontlineTranslation } from '@/shared/i18n/useFrontlineTranslation';
import { useNavigate } from 'react-router-dom';
import {
  ActivityLogs,
  IRecordPanelProps,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { ArticleDrawer } from '@/knowledgebase/articles/components/ArticleDrawer';
import { useArticleDetail } from '@/knowledgebase/articles/hooks/useArticles';
import {
  useDuplicateArticle,
  useRemoveArticles,
} from '@/knowledgebase/articles/hooks/useArticleMutations';
import { CategoryDrawer } from '@/knowledgebase/categories/components/CategoryDrawer';
import { useConfirmRemoveCategory } from '@/knowledgebase/categories/hooks/useConfirmRemoveCategory';
import {
  KB_RECORD_CONTENT_TYPES,
  KB_DRAFT_CONTENT_TYPES,
  KNOWLEDGE_BASE_PATH,
} from '@/knowledgebase/constants';
import { CATEGORY_DETAIL } from '@/knowledgebase/graphql/queries';
import { TopicEmbedScriptDialog } from '@/knowledgebase/shared/components/TopicEmbedScriptDialog';
import { useKbConfirmRemove } from '@/knowledgebase/shared/hooks/useKbConfirmRemove';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';
import { TopicDrawer } from '@/knowledgebase/topics/components/TopicDrawer';
import type { IArticleDetail } from '@/knowledgebase/types';

type TKbKind = keyof typeof KB_RECORD_CONTENT_TYPES;

const KnowledgeBasePanelActions = ({
  kind,
  id,
  title,
  topicId,
  article,
}: {
  kind: TKbKind;
  id: string;
  title?: string | null;
  topicId: string;
  article?: IArticleDetail;
}) => {
  const { t } = useFrontlineTranslation('modules.knowledgebase');
  const { close } = useSidePanel();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');
  const { duplicateArticle, loading: duplicating } =
    useDuplicateArticle(topicId);
  const { removeArticles, loading: removingArticle } = useRemoveArticles();
  const { confirmRemoveCategory, loading: removingCategory } =
    useConfirmRemoveCategory();
  const confirmRemove = useKbConfirmRemove();
  const [scriptOpen, setScriptOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const disabled =
    pending || duplicating || removingArticle || removingCategory;

  const handleDelete = async () => {
    if (disabled) return;
    setPending(true);
    try {
      if (kind === 'category') {
        await confirmRemoveCategory({ _id: id, title }, () => {
          close();
          if (categoryId === id) setCategoryId(null);
        });
      } else if (kind === 'article') {
        await confirmRemove({
          message: t('kb-confirm-delete-article', {
            title: title || t('kb-untitled-article', 'Untitled article'),
            defaultValue: 'Are you sure you want to delete "{{title}}"?',
          }),
          removedMessage: t('kb-article-deleted', 'Article deleted'),
          remove: () => removeArticles([id]),
          onRemoved: close,
        });
      }
    } catch {
      // Removal hooks report mutation failures; a dismissed confirmation is cancelled.
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={disabled}
            aria-label={t('actions', 'Actions')}
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {article && (
            <DropdownMenu.Item
              disabled={disabled}
              onSelect={() => duplicateArticle(article)}
            >
              <IconCopy /> {t('kb-duplicate', 'Duplicate')}
            </DropdownMenu.Item>
          )}
          {kind === 'topic' && (
            <>
              <DropdownMenu.Item
                disabled={disabled}
                onSelect={() => setScriptOpen(true)}
              >
                <IconCode /> {t('kb-embed-script', 'Embed script')}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() =>
                  navigate(`${KNOWLEDGE_BASE_PATH}/${id}/kbsettings`)
                }
              >
                <IconSettings /> {t('settings', 'Settings')}
              </DropdownMenu.Item>
            </>
          )}
          {kind !== 'topic' && (
            <DropdownMenu.Item
              className="text-destructive"
              disabled={disabled}
              onSelect={handleDelete}
            >
              <IconTrash /> {t('delete', 'Delete')}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
      {kind === 'topic' && (
        <TopicEmbedScriptDialog
          topicId={id}
          open={scriptOpen}
          onOpenChange={setScriptOpen}
          t={t}
        />
      )}
    </>
  );
};

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
  kind: TKbKind;
  record?: { _id: string; title?: string | null };
  loading: boolean;
  error?: Error;
  view: IRecordPanelProps['view'];
  contentId: string;
  topicId: string;
  article?: IArticleDetail;
  children: ReactNode;
}) => {
  const { t } = useFrontlineTranslation('modules.knowledgebase');

  if (view === 'title') {
    return loading && !record ? (
      <Skeleton className="h-4 w-32" />
    ) : (
      record?.title || t('knowledge-base', 'Knowledge Base')
    );
  }
  if (view === 'actions') {
    return record ? (
      <KnowledgeBasePanelActions
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
                t('kb-record-not-found', 'This record is no longer available.')}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }
  if (view === 'activity') {
    return (
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <ActivityLogs targetId={contentId} showInternalNotes={false} />
      </ScrollArea>
    );
  }
  return children;
};

const ArticlePanel = (props: IRecordPanelProps) => {
  const { article, loading, error } = useArticleDetail(props.contentId);
  const { close } = useSidePanel();
  const {
    data: placement,
    loading: placementLoading,
    error: placementError,
  } = useQuery(CATEGORY_DETAIL, {
    variables: { _id: article?.categoryId || '' },
    skip: !article?.categoryId || !!article.topicId,
  });
  const topicId =
    article?.topicId ||
    placement?.knowledgeBaseCategoryDetail?.firstTopic?._id ||
    '';

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
      {article && (
        <ArticleDrawer
          key={article._id}
          articleId={article._id}
          topicId={topicId}
          categoryId={article.categoryId || ''}
          isOpen
          onClose={close}
          panel
        />
      )}
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
      {topic && (
        <TopicDrawer
          key={topic._id}
          topic={topic}
          isOpen
          onClose={close}
          panel
        />
      )}
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
          isOpen
          onClose={close}
          panel
        />
      )}
    </KnowledgeBasePanelView>
  );
};

const KnowledgeBasePanelNew = ({ contentType }: IRecordPanelProps) => {
  const draft = useSidePanelDraft<{ topicId: string; categoryId: string }>(
    contentType,
  );
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
        isOpen
        onClose={onClose}
        panel
      />
    );
  if (
    contentType === KB_DRAFT_CONTENT_TYPES.category ||
    contentType === KB_RECORD_CONTENT_TYPES.category
  )
    return (
      <CategoryDrawer
        topicId={draft.topicId || ''}
        isOpen
        onClose={onClose}
        panel
      />
    );
  return <TopicDrawer isOpen onClose={onClose} panel />;
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
