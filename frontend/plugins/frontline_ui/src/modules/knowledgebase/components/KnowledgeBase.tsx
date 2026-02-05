import { useMutation } from '@apollo/client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { REMOVE_TOPIC } from '../graphql/mutations';
import { useTopics } from '../hooks/useTopics';
import { useArticles } from '../hooks/useArticles';
import { ICategory, ITopic } from '../types';
import { ArticleDrawer } from './ArticleDrawer';
import { ArticleList } from './ArticleList';
import { TopicDrawer } from './TopicDrawer';
import { TopicList } from './TopicList';
import { CategoryDrawer } from './CategoryDrawer';
import { IconCaretRightFilled, IconSearch } from '@tabler/icons-react';
import { Button, Sidebar } from 'erxes-ui';

export function KnowledgeBase() {
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(false);
  const [isArticleDrawerOpen, setIsArticleDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<ITopic | undefined>(
    undefined,
  );
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<ICategory | undefined>(
    undefined,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentCategory, setCurrentCategory] = useState<ICategory | null>(
    null,
  );

  const selectedCategoryId = searchParams.get('categoryId');
  const selectedTopicId = searchParams.get('topicId');

  const { topics, loading, refetch } = useTopics();
  
  // Memoize setSearchParams to prevent infinite loops
  const memoizedSetSearchParams = useCallback((updater: (prev: URLSearchParams) => URLSearchParams) => {
    setSearchParams(updater);
  }, [setSearchParams]);
  
  // Get selected topic
  const selectedTopic = topics.find(topic => topic._id === selectedTopicId);
  const hasCategories = selectedTopic?.categories && selectedTopic.categories.length > 0;
  
  const { refetch: refetchArticles } = useArticles({
    categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
  });
  const [removeTopic] = useMutation(REMOVE_TOPIC);

  useEffect(() => {
    if (selectedCategoryId && topics.length > 0) {
      const category = topics
        .flatMap((topic: ITopic) => topic.categories || [])
        .find((cat: ICategory) => cat._id === selectedCategoryId);

      setCurrentCategory(category || null);
    } else {
      setCurrentCategory(null);
    }
  }, [selectedCategoryId, topics]);

  // Auto-select first category when topic is selected
  useEffect(() => {
    if (selectedTopicId && topics.length > 0) {
      const selectedTopic = topics.find(topic => topic._id === selectedTopicId);
      
      // Check if selected category belongs to the current topic
      const isCategoryBelongsToTopic = selectedCategoryId && 
        selectedTopic?.categories?.some(cat => cat._id === selectedCategoryId);
      
      // Auto-select only if no category selected OR selected category doesn't belong to this topic
      if ((!selectedCategoryId || !isCategoryBelongsToTopic) && 
          selectedTopic?.categories && selectedTopic.categories.length > 0) {
        const firstCategory = selectedTopic.categories[0];
        
        memoizedSetSearchParams((prev) => {
          const next = new URLSearchParams(prev.toString());
          next.set('categoryId', firstCategory._id);
          return next;
        });
      }
    }
  }, [selectedTopicId, selectedCategoryId, topics, memoizedSetSearchParams]);

  // Check for createTopic URL parameter
  useEffect(() => {
    const createTopic = searchParams.get('createTopic');
    if (createTopic === 'true') {
      setIsTopicDrawerOpen(true);
      // Remove the parameter from URL
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev.toString());
        next.delete('createTopic');
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

  const handleCloseTopicDrawer = () => {
    setIsTopicDrawerOpen(false);
    setEditingTopic(undefined);
  };

  const handleCloseArticleDrawer = () => {
    setIsArticleDrawerOpen(false);
    setEditingArticle(null);
  };

  const handleCloseCategoryDrawer = () => {
    setIsCategoryDrawerOpen(false);
    setEditingCategory(undefined);
  };

  const handleArticleSaved = () => {
    refetchArticles();
    handleCloseArticleDrawer();
  };

  return (
    <div className="flex-1 p-4 overflow-hidden">
      {/* Show no category state when topic is selected but has no categories */}
      {selectedTopicId && !selectedCategoryId && !hasCategories && !isArticleDrawerOpen && !isCategoryDrawerOpen && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              No categories found
            </div>
            <div className="text-sm opacity-70 mb-4">
              This topic doesn't have any categories yet. Create your first category to start organizing articles.
            </div>
            <Button onClick={() => setIsCategoryDrawerOpen(true)}>
              Create Category
            </Button>
          </div>
        </div>
      )}
      
      {selectedCategoryId && !isArticleDrawerOpen && (
        <ArticleList
          onCreateArticle={() => setIsArticleDrawerOpen(true)}
          onEditArticle={(article) => {
            setEditingArticle(article);
            setIsArticleDrawerOpen(true);
          }}
        />
      )}

      {!selectedTopicId && !selectedCategoryId && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-sm opacity-70">Loading topics...</div>
            </div>
          ) : topics.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">
                  There are no topics yet
                </div>
                <div className="text-sm opacity-70 mb-4">
                  Create your first topic and start your knowledge base.
                </div>
                <Button onClick={() => setIsTopicDrawerOpen(true)}>
                  Create Topic
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic: ITopic) => (
                <div key={topic._id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {topic.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {topic.categories?.length || 0} categories
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev.toString());
                          next.set('topicId', topic._id);
                          return next;
                        });
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <TopicDrawer
        topic={editingTopic}
        isOpen={isTopicDrawerOpen}
        onClose={handleCloseTopicDrawer}
        onSaved={() => refetch()}
      />

      <CategoryDrawer
        category={editingCategory}
        topicId={selectedTopicId || ''}
        isOpen={isCategoryDrawerOpen}
        onClose={handleCloseCategoryDrawer}
        refetch={refetch}
      />

      <ArticleDrawer
        article={editingArticle}
        categoryId={selectedCategoryId || ''}
        isOpen={isArticleDrawerOpen}
        onClose={handleCloseArticleDrawer}
        onSaved={handleArticleSaved}
        refetch={refetchArticles}
      />
    </div>
  );
}
