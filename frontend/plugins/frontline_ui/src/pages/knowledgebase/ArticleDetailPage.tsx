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
  IconBook,
  IconHistory,
  IconId,
  IconInfoCircle,
  IconPhoto,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  createFavoriteBreadcrumb,
  PageHeader,
  RecordSidePanel,
} from 'ui-modules';
import { ArticleDrawer } from '@/knowledgebase/articles/components/ArticleDrawer';
import { useArticleDetail } from '@/knowledgebase/articles/hooks/useArticles';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { useTopicDetail } from '@/knowledgebase/shared/hooks/useTopicDetail';

export const ArticleDetailPage = () => {
  const { articleId = '' } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useQueryState<string>('tab');
  const { article, loading, error } = useArticleDetail(articleId);
  const { topic } = useTopicDetail(article?.topicId);

  if (loading && !article) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!article) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Title>Article not found</Empty.Title>
            <Empty.Description>
              {error?.message || 'This article could not be loaded.'}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }

  const editorProps = {
    articleId: article._id,
    article,
    topicId: article.topicId || '',
    categoryId: article.categoryId || '',
    onClose: () => navigate(-1),
  };
  const topicLabel = topic?.title || 'Unnamed topic';

  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <PageHeader>
          <PageHeader.Start>
            <Breadcrumb>
              <Breadcrumb.List className="gap-1">
                <Breadcrumb.Item>
                  <Button variant="ghost" asChild>
                    <Link to={KNOWLEDGE_BASE_PATH}>
                      <IconBook />
                      Knowledge Base
                    </Link>
                  </Button>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Button variant="ghost" asChild>
                    <Link
                      to={`${KNOWLEDGE_BASE_PATH}/${article.topicId}/articles`}
                    >
                      {topicLabel}
                    </Link>
                  </Button>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Button variant="ghost">Articles</Button>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton
              breadcrumb={createFavoriteBreadcrumb(
                'Knowledge Base',
                topicLabel,
                'Articles',
              )}
              icon="IconBook"
            />
          </PageHeader.Start>
        </PageHeader>
        <RecordSidePanel.Tabs
          key={article._id}
          value={tab ?? 'detail'}
          onValueChange={setTab}
          visibleCount={3}
          overviewTab="detail"
          expandedDefaultTab="media"
          tabs={[
            {
              value: 'detail',
              label: 'Detail',
              icon: IconId,
              content: <ArticleDrawer {...editorProps} />,
            },
            {
              value: 'media',
              label: 'Media',
              icon: IconPhoto,
              content: <ArticleDrawer {...editorProps} section="media" />,
            },
            {
              value: 'activity',
              label: 'Activity',
              icon: IconHistory,
              content: (
                <div className="flex flex-1 items-center justify-center p-6">
                  <Empty>
                    <Empty.Header>
                      <Empty.Media variant="icon">
                        <IconInfoCircle />
                      </Empty.Media>
                      <Empty.Title>Activity</Empty.Title>
                      <Empty.Description>
                        Activity history is not available for knowledge base
                        articles.
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
