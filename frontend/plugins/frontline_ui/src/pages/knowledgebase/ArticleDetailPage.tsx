import {
  Breadcrumb,
  Button,
  Empty,
  PageContainer,
  Separator,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import {
  IconAlignLeft,
  IconBook,
  IconHistory,
  IconId,
  IconInfoCircle,
  IconPhoto,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createFavoriteBreadcrumb,
  PageHeader,
  RecordSidePanel,
} from 'ui-modules';
import { ArticleDrawer } from '@/knowledgebase/articles/components/ArticleDrawer';
import { ArticleMediaSlot } from '@/knowledgebase/articles/components/ArticleMediaSlot';
import { useArticleDetail } from '@/knowledgebase/articles/hooks/useArticles';
import {
  ARTICLE_CONTENT_TAB,
  ARTICLE_MEDIA_TAB,
  KNOWLEDGE_BASE_PATH,
} from '@/knowledgebase/constants';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';

const DETAIL_TAB = 'detail';
const ACTIVITY_TAB = 'activity';

export const ArticleDetailPage = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const { t: tPanel } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { articleId = '' } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useQueryState<string>('tab');
  const { article, loading, error } = useArticleDetail(articleId);
  const { topic } = useTopicDetail(article?.topicId ?? undefined);

  if (loading && !article) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!article) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Title>
              {t('kb-article-not-found', 'Article not found')}
            </Empty.Title>
            <Empty.Description>
              {error?.message ||
                t(
                  'kb-article-load-failed',
                  'This article could not be loaded.',
                )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }

  const knowledgeBaseLabel = t('knowledge-base', 'Knowledge Base');
  const articlesLabel = t('articles', 'Articles');
  const topicLabel = topic?.title || t('unnamed-topic', 'Unnamed topic');
  const articlesPath = article.topicId
    ? `${KNOWLEDGE_BASE_PATH}/${article.topicId}/articles`
    : KNOWLEDGE_BASE_PATH;

  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <PageHeader>
          <PageHeader.Start className="flex-auto min-w-0">
            <Breadcrumb className="min-w-0">
              <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
                <Breadcrumb.Item className="shrink-0">
                  <Button variant="ghost" asChild>
                    <Link to={KNOWLEDGE_BASE_PATH}>
                      <IconBook />
                      {knowledgeBaseLabel}
                    </Link>
                  </Button>
                </Breadcrumb.Item>
                {article.topicId && (
                  <>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item className="shrink-0">
                      <Button variant="ghost" asChild>
                        <Link to={articlesPath}>{topicLabel}</Link>
                      </Button>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item className="shrink-0">
                      <Button variant="ghost" asChild>
                        <Link to={articlesPath}>{articlesLabel}</Link>
                      </Button>
                    </Breadcrumb.Item>
                  </>
                )}
                <Breadcrumb.Separator />
                <Breadcrumb.Item className="min-w-0">
                  <Breadcrumb.Page className="block min-w-0 max-w-md truncate px-2 text-sm">
                    {article.title ||
                      t('kb-untitled-article', 'Untitled article')}
                  </Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton
              breadcrumb={createFavoriteBreadcrumb(
                knowledgeBaseLabel,
                topicLabel,
                articlesLabel,
              )}
              icon="IconBook"
            />
          </PageHeader.Start>
        </PageHeader>
        <RecordSidePanel.Tabs
          key={article._id}
          value={tab ?? ARTICLE_CONTENT_TAB}
          onValueChange={setTab}
          visibleCount={3}
          overviewTab={DETAIL_TAB}
          expandedDefaultTab={ARTICLE_CONTENT_TAB}
          tabs={[
            {
              value: DETAIL_TAB,
              label: tPanel('detail', 'Detail'),
              icon: IconId,
              content: (
                <ArticleDrawer
                  articleId={article._id}
                  article={article}
                  topicId={article.topicId || ''}
                  categoryId={article.categoryId || ''}
                  closeOnSave={false}
                  mediaTab
                  contentTab
                  onClose={() => navigate(articlesPath, { replace: true })}
                />
              ),
            },
            {
              value: ARTICLE_CONTENT_TAB,
              label: t('content-label', 'Content'),
              icon: IconAlignLeft,
              content: (
                <ArticleMediaSlot
                  articleId={article._id}
                  tab={ARTICLE_CONTENT_TAB}
                />
              ),
            },
            {
              value: ARTICLE_MEDIA_TAB,
              label: t('kb-media', 'Media'),
              icon: IconPhoto,
              content: <ArticleMediaSlot articleId={article._id} />,
            },
            {
              value: ACTIVITY_TAB,
              label: tPanel('activity', 'Activity'),
              icon: IconHistory,
              content: (
                <div className="flex flex-1 items-center justify-center p-6">
                  <Empty>
                    <Empty.Header>
                      <Empty.Media variant="icon">
                        <IconInfoCircle />
                      </Empty.Media>
                      <Empty.Title>
                        {tPanel('activity', 'Activity')}
                      </Empty.Title>
                      <Empty.Description>
                        {t(
                          'kb-activity-unavailable',
                          'Activity history is not available for knowledge base records.',
                        )}
                      </Empty.Description>
                    </Empty.Header>
                  </Empty>
                </div>
              ),
            },
          ]}
        />
      </RecordSidePanel>
    </PageContainer>
  );
};
