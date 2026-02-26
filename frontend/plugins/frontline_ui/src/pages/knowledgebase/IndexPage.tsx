import { Breadcrumb, Button, PageContainer, Kbd, Separator } from 'erxes-ui';
import { Link, useSearchParams } from 'react-router-dom';
import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { IconLibraryPhoto, IconPlus, IconStar } from '@tabler/icons-react';
import { KnowledgeBase } from '../../modules/knowledgebase/components/KnowledgeBase';
import { useMemo, useState } from 'react';
import { TopicDrawer } from '../../modules/knowledgebase/components/TopicDrawer';
import { ArticleDrawer } from '../../modules/knowledgebase/components/ArticleDrawer';
import { useTopics } from '../../modules/knowledgebase/hooks/useTopics';
import { useMutation } from '@apollo/client';
import { REMOVE_TOPIC } from '../../modules/knowledgebase/graphql/mutations';

const IndexPage = () => {
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(false);
  const [isArticleDrawerOpen, setIsArticleDrawerOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(undefined);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const { topics, refetch } = useTopics();
  const [removeTopic] = useMutation(REMOVE_TOPIC);

  const topicId = searchParams.get('topicId') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const currentTopic = useMemo(
    () => (topics || []).find((t: any) => t._id === topicId),
    [topics, topicId],
  );

  const currentCategory = useMemo(() => {
    const cats = currentTopic?.categories || [];
    return (cats || []).find((c: any) => c._id === categoryId);
  }, [currentTopic, categoryId]);

  const lastLabel = categoryId
    ? 'Articles'
    : topicId
      ? 'Categories'
      : 'Knowledge Base';

  const handleEditTopic = (topic: any) => {
    setEditingTopic(topic);
    setIsTopicDrawerOpen(true);
  };

  const handleRemoveTopic = (_id: string) => {
    removeTopic({ variables: { _id } }).then(() => refetch());
  };

  const handleCloseTopicDrawer = () => {
    setIsTopicDrawerOpen(false);
    setEditingTopic(undefined);
  };

  const handleCloseArticleDrawer = () => {
    setIsArticleDrawerOpen(false);
    setEditingArticle(null);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/knowledgeBase">
                    <IconLibraryPhoto className="h-4 w-4" />
                    Knowledge Base
                  </Link>
                </Button>
              </Breadcrumb.Item>

              {topicId ? (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Button variant="ghost" asChild>
                      <Link to={`/frontline/knowledgeBase?topicId=${topicId}`}>
                        {currentTopic?.title || 'Unnamed topic'}
                      </Link>
                    </Button>
                  </Breadcrumb.Item>
                </>
              ) : null}

              {categoryId ? (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Button variant="ghost" asChild>
                      <Link
                        to={`/frontline/knowledgeBase?topicId=${topicId}&categoryId=${categoryId}`}
                      >
                        {currentCategory?.title || 'Unnamed category'}
                      </Link>
                    </Button>
                  </Breadcrumb.Item>
                </>
              ) : null}

              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">{lastLabel}</Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>

          <Separator.Inline />
          <Button variant="ghost" size="icon" type="button">
            <FavoriteToggleIconButton />
          </Button>
        </PageHeader.Start>

        <PageHeader.End>
          <Button
            onClick={() =>
              categoryId
                ? setIsArticleDrawerOpen(true)
                : setIsTopicDrawerOpen(true)
            }
            className="h-7 py-1"
          >
            <IconPlus className="w-4 h-4" />
            {categoryId ? 'New Article' : 'New Topic'}
            <Kbd>C</Kbd>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <KnowledgeBase />

      <TopicDrawer
        topic={editingTopic}
        isOpen={isTopicDrawerOpen}
        onClose={handleCloseTopicDrawer}
        onSaved={() => refetch()}
      />

      <ArticleDrawer
        article={editingArticle}
        categoryId={categoryId}
        isOpen={isArticleDrawerOpen}
        onClose={handleCloseArticleDrawer}
        onSaved={() => {}}
      />
    </PageContainer>
  );
};

export default IndexPage;
