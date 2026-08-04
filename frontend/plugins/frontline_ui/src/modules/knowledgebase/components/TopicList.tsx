import { useMutation } from '@apollo/client';
import {
  cn,
  Collapsible,
  DropdownMenu,
  Sidebar,
  Spinner,
  useConfirm,
  toast,
} from 'erxes-ui';

import { IconDotsVertical } from '@tabler/icons-react';

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { REMOVE_CATEGORY } from '../graphql/mutations';
import { useTopics } from '../hooks/useTopics';
import { ICategory, ITopic } from '../types';
import { CategoryDrawer } from './CategoryDrawer';
import { useTranslation } from 'react-i18next';

interface TopicListProps {
  readonly topics: ITopic[];
  readonly loading: boolean;
  readonly removeTopic: (topicId: string) => void;
  readonly onEditTopic: (topic: ITopic) => void;
  readonly onAddCategory?: (topicId: string) => void;
}

export function TopicList(props: TopicListProps) {
  const { t } = useTranslation('frontline');
  const { topics, loading, removeTopic, onEditTopic, onAddCategory } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const [removeCategory] = useMutation(REMOVE_CATEGORY);
  const { refetch } = useTopics();
  const { confirm } = useConfirm();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | undefined>(
    undefined,
  );
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(
    undefined,
  );
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false);
  const [isTopicsCollapsed, setIsTopicsCollapsed] = useState(false);

  const handleDeleteCategory = async (category: ICategory) => {
    const message = t('kb-confirm-delete-category', { title: category.title });

    const confirmOptions = {
      confirmationValue: 'delete',
      description: t('kb-action-permanent'),
    };

    try {
      await confirm({
        message,
        options: confirmOptions,
      });

      await removeCategory({
        variables: {
          _id: category._id,
        },
      }).then(() => {
        refetch();
      });
    } catch (error) {
      toast({
        type: 'foreground',
        title: t('kb-failed-delete-category'),
      });
    }
  };

  useEffect(() => {
    if (!loading && topics.length > 0) {
      const topicId = searchParams.get('topicId');
      const firstTopic = topics[0];

      const newParams: Record<string, string> = {};

      if (!topicId && firstTopic) {
        newParams.topicId = firstTopic._id;
      }

      if (Object.keys(newParams).length > 0) {
        setSearchParams((prev) => {
          const updated = new URLSearchParams(prev.toString());
          Object.entries(newParams).forEach(([key, value]) => {
            updated.set(key, value);
          });
          return updated;
        });
      }
    }
  }, [loading, searchParams, setSearchParams, topics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  // Collect all categories from all topics
  const allCategories = topics.flatMap((topic) =>
    (topic.categories || []).map((category) => ({
      ...category,
      topicId: topic._id,
      topicTitle: topic.title,
    })),
  );

  const renderCategoryActions = (category: any) => (
    <DropdownMenu>
      <DropdownMenu.Trigger className="ml-2 p-2">
        <IconDotsVertical className="w-4 h-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            setEditingCategory(category);
            setIsCategoryDrawerOpen(true);
          }}
        >
          {t('kb-edit-category')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            setEditingCategory(category);
            setParentCategoryId(category._id);
            setIsCategoryDrawerOpen(true);
          }}
        >
          {t('kb-add-sub-category')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => handleDeleteCategory(category)}>
          {t('kb-delete-category')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  return (
    <>
      {/* Topics Section */}
      <Collapsible defaultOpen className="group/collapsible">
        <Sidebar.Group>
          <Sidebar.GroupLabel
            className="cursor-pointer flex items-center justify-between"
            onClick={() => setIsTopicsCollapsed(!isTopicsCollapsed)}
          >
            <span>{t('kb-topics')}</span>
          </Sidebar.GroupLabel>
          <Collapsible.Content
            className={isTopicsCollapsed ? 'hidden' : 'block'}
          >
            <Sidebar.GroupContent className="pt-2">
              <Sidebar.Menu>
                {topics.map((topic) => {
                  return (
                    <TopicItem
                      key={topic._id}
                      topic={topic}
                      removeTopic={removeTopic}
                      onEditTopic={onEditTopic}
                      onAddCategory={onAddCategory}
                    />
                  );
                })}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Collapsible.Content>
        </Sidebar.Group>
      </Collapsible>

      {/* Categories Section */}
      <Collapsible defaultOpen className="group/collapsible">
        <Sidebar.Group>
          <Sidebar.GroupLabel
            className="cursor-pointer flex items-center justify-between"
            onClick={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
          >
            <span>{t('kb-categories')}</span>
          </Sidebar.GroupLabel>
          <Collapsible.Content
            className={isCategoriesCollapsed ? 'hidden' : 'block'}
          >
            <Sidebar.GroupContent className="p-2">
              <Sidebar.Menu>
                {allCategories.map((category) => {
                  const isSubmenuActive =
                    category._id === searchParams.get('categoryId');
                  return (
                    <Sidebar.MenuItem key={category._id}>
                      <Sidebar.MenuButton
                        onClick={() => {
                          setSearchParams((prev) => {
                            const next = new URLSearchParams(prev);
                            next.set('categoryId', category._id);
                            return next;
                          });
                        }}
                        className={cn(
                          'flex items-center gap-2 flex-grow',
                          isSubmenuActive &&
                            'bg-primary/10 text-primary font-semibold',
                        )}
                      >
                        <span className="truncate">{category.title}</span>
                        {renderCategoryActions(category)}
                      </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                  );
                })}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Collapsible.Content>
        </Sidebar.Group>
      </Collapsible>

      {/* Category Drawer */}
      <CategoryDrawer
        refetch={refetch}
        topicId={editingCategory?.topicId || ''}
        parentCategoryId={parentCategoryId}
        category={editingCategory}
        isOpen={isCategoryDrawerOpen}
        onClose={() => {
          setIsCategoryDrawerOpen(false);
          setParentCategoryId(undefined);
          setEditingCategory(undefined);
        }}
      />
    </>
  );
}

export function TopicItem(props: {
  readonly topic: ITopic;
  readonly removeTopic: (topicId: string) => void;
  readonly onEditTopic: (topic: ITopic) => void;
  readonly onAddCategory?: (topicId: string) => void;
}) {
  const { t } = useTranslation('frontline');
  const [removeCategory] = useMutation(REMOVE_CATEGORY);
  const { refetch } = useTopics();
  const { topic, removeTopic, onEditTopic, onAddCategory } = props;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { confirm } = useConfirm();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(
    undefined,
  );
  const [editingCategory, setEditingCategory] = useState<ICategory | undefined>(
    undefined,
  );
  const isActive = topic._id === searchParams.get('topicId');
  const parentCategories = topic.parentCategories ?? [];

  const handleDeleteTopic = async (topic: ITopic) => {
    const categoryCount = topic.categories?.length || 0;
    const message = t('kb-confirm-delete-topic-with-count', {
      title: topic.title,
      count: categoryCount,
    });

    const confirmOptions = {
      confirmationValue: 'delete',
      description: t('kb-action-permanent'),
    };

    try {
      await confirm({
        message,
        options: confirmOptions,
      });

      removeTopic(topic._id);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleDeleteCategory = async (category: ICategory) => {
    const message = t('kb-confirm-delete-category', { title: category.title });

    const confirmOptions = {
      confirmationValue: 'delete',
      description: t('kb-action-permanent'),
    };

    try {
      await confirm({
        message,
        options: confirmOptions,
      });

      await removeCategory({
        variables: {
          _id: category._id,
        },
      }).then(() => {
        refetch();
      });
    } catch (error) {
      toast({
        type: 'foreground',
        title: t('kb-failed-delete-category'),
      });
    }
  };

  const renderTopicActions = (topic: ITopic) => {
    const hasCategories = topic.categories && topic.categories.length > 0;

    return (
      <DropdownMenu>
        <DropdownMenu.Trigger className="ml-2 p-2">
          <IconDotsVertical className="w-4 h-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" sideOffset={5}>
          <DropdownMenu.Item onClick={() => onEditTopic(topic)}>
            {t('kb-edit-topic')}
          </DropdownMenu.Item>
          {!hasCategories && (
            <DropdownMenu.Item
              onClick={() => {
                if (onAddCategory) {
                  onAddCategory(topic._id);
                } else {
                  setEditingCategory(undefined);
                  setParentCategoryId(undefined);
                  setIsCategoryDrawerOpen(true);
                }
              }}
            >
              {t('kb-add-category')}
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onClick={() => handleDeleteTopic(topic)}
            className="text-destructive"
          >
            {t('kb-delete-topic')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  };

  const renderCategoryActions = (
    category: ICategory,
    isSubCategory?: boolean,
  ) => (
    <DropdownMenu>
      <DropdownMenu.Trigger className="ml-2 p-2">
        <IconDotsVertical className="w-4 h-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            setEditingCategory(category);
            setIsCategoryDrawerOpen(true);
          }}
        >
          {t('kb-edit-category')}
        </DropdownMenu.Item>
        {!isSubCategory && (
          <DropdownMenu.Item
            onClick={() => {
              setParentCategoryId(category._id);
              setIsCategoryDrawerOpen(true);
            }}
          >
            {t('kb-add-sub-category')}
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => handleDeleteCategory(category)}>
          {t('kb-delete-category')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  return (
    <>
      <Collapsible asChild open={isActive} className="group/collapsible">
        <Sidebar.MenuItem key={topic._id}>
          <Sidebar.MenuButton
            onClick={() => {
              navigate(`?topicId=${topic._id}`);
            }}
            className={cn(
              'group flex items-center justify-between',
              isActive && 'bg-primary/10 text-primary font-semibold',
            )}
          >
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate">{topic.title}</span>
              <div className="opacity-70 hover:opacity-100 transition">
                {renderTopicActions(topic)}
              </div>
            </div>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Collapsible>

      <CategoryDrawer
        refetch={refetch}
        topicId={topic._id}
        parentCategoryId={parentCategoryId}
        category={editingCategory}
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />
    </>
  );
}
