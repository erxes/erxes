import { useMutation } from '@apollo/client';
import { Button, Sidebar } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { REMOVE_TOPIC } from '../graphql/mutations';
import { useTopics } from '../hooks/useTopics';
import { ICategory, ITopic } from '../types';
import { ArticleDrawer } from './ArticleDrawer';
import { ArticleList } from './ArticleList';
import { TopicDrawer } from './TopicDrawer';
import { TopicList } from './TopicList';

export function KnowledgeBase() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(false);
  const [isArticleDrawerOpen, setIsArticleDrawerOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<ITopic | undefined>(
    undefined,
  );
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const [currentCategory, setCurrentCategory] = useState<ICategory | null>(
    null,
  );
  const { topics, handleFetchMore, loading, pageInfo, refetch } = useTopics();

  const [removeTopic] = useMutation(REMOVE_TOPIC);

  const selectedCategoryId = searchParams.get('categoryId');

  useEffect(() => {
    if (selectedCategoryId && topics.length > 0) {
      const category = topics
        .flatMap((topic: ITopic) => topic.categories || [])
        .find((cat: ICategory) => cat._id === selectedCategoryId);

      if (category) {
        setCurrentCategory(category);
      }
    }
  }, [selectedCategoryId, topics]);

  const handleCloseTopicDrawer = () => {
    setIsTopicDrawerOpen(false);
    setEditingTopic(undefined);
  };

  const handleCloseArticleDrawer = () => {
    setIsArticleDrawerOpen(false);
    setEditingArticle(null);
  };

  return (
    <div className="flex h-full">
      <Sidebar collapsible="none" className="border-r flex-none">
        <Sidebar.Group>
          <Sidebar.GroupLabel>Knowledge Base</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <div className="p-4">
              <Button
                onClick={() => setIsTopicDrawerOpen(true)}
                className="w-full"
              >
                New Topic
              </Button>
            </div>
            <TopicList
              topics={topics}
              loading={loading}
              removeTopic={(_id) =>
                removeTopic({
                  variables: {
                    _id,
                  },
                }).then(() => {
                  refetch();
                })
              }
              onEditTopic={(topic) => {
                setEditingTopic(topic);
                setIsTopicDrawerOpen(true);
                refetch();
              }}
            />
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar>

      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedCategoryId
              ? 'Articles in ' + currentCategory?.title
              : 'Select a category to view articles'}
          </h2>
          {selectedCategoryId && (
            <Button onClick={() => setIsArticleDrawerOpen(true)}>
              New Article
            </Button>
          )}
        </div>

        {selectedCategoryId && (
          <ArticleList
            categoryId={selectedCategoryId}
            onEditArticle={(article) => {
              setEditingArticle(article);
              setIsArticleDrawerOpen(true);
            }}
          />
        )}
      </div>

      <TopicDrawer
        topic={editingTopic}
        isOpen={isTopicDrawerOpen}
        onClose={handleCloseTopicDrawer}
      />

      <ArticleDrawer
        article={editingArticle}
        categoryId={selectedCategoryId || ''}
        isOpen={isArticleDrawerOpen}
        onClose={handleCloseArticleDrawer}
      />
    </div>
  );
}
