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
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { REMOVE_CATEGORY } from '../graphql/mutations';
import { useTopics } from '../hooks/useTopics';
import { ICategory, ITopic } from '../types';
import {CategoryDrawer }from './CategoryDrawer';

interface TopicListProps {
  topics: ITopic[];
  loading: boolean;

  removeTopic: (topicId: string) => void;
  onEditTopic: (topic: ITopic) => void;
  onAddCategory?: (topicId: string) => void;
}

export function TopicList(props: TopicListProps) {
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
    const message = `Are you sure you want to delete "${category.title}"? This will also delete all associated articles. This action cannot be undone.`;

    const confirmOptions = {
      confirmationValue: 'delete',
      description: 'This action is permanent and cannot be undone.',
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
        title: 'Failed to delete category. Please try again.',
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
  const allCategories = topics.flatMap(topic => 
    (topic.categories || []).map(category => ({
      ...category,
      topicId: topic._id,
      topicTitle: topic.title
    }))
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
          Edit Category
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            setEditingCategory(category);
            setParentCategoryId(category._id);
            setIsCategoryDrawerOpen(true);
          }}
        >
          Add Sub Category
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => handleDeleteCategory(category)}>
          Delete Category
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
            <span>Topics</span>
          </Sidebar.GroupLabel>
          <Collapsible.Content className={!isTopicsCollapsed ? 'block' : 'hidden'}>
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
            <span>Categories</span>
          </Sidebar.GroupLabel>
          <Collapsible.Content className={!isCategoriesCollapsed ? 'block' : 'hidden'}>
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
                        isSubmenuActive && 'bg-primary/10 text-primary font-semibold',
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
        topicId={editingCategory?.topicId || ""}
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
  topic: ITopic;
  removeTopic: (topicId: string) => void;
  onEditTopic: (topic: ITopic) => void;
  onAddCategory?: (topicId: string) => void;
}) {
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
    const message = `Are you sure you want to delete "${topic.title}"? This will also delete ${categoryCount} categories and all their associated articles. This action cannot be undone.`;

    const confirmOptions = {
      confirmationValue: 'delete',
      description: 'This action is permanent and cannot be undone.',
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
    const message = `Are you sure you want to delete "${category.title}"? This will also delete all associated articles. This action cannot be undone.`;

    const confirmOptions = {
      confirmationValue: 'delete',
      description: 'This action is permanent and cannot be undone.',
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
        title: 'Failed to delete category. Please try again.',
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
            Edit Topic
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
              Add Category
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onClick={() => handleDeleteTopic(topic)}
            className="text-red-600"
          >
            Delete Topic
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
          Edit Category
        </DropdownMenu.Item>
        {!isSubCategory && (
          <DropdownMenu.Item
            onClick={() => {
              setParentCategoryId(category._id);
              setIsCategoryDrawerOpen(true);
            }}
          >
            Add Sub Category
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={() => handleDeleteCategory(category)}>
          Delete Category
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
